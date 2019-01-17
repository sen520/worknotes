const { setResult, setError } = require('./utility');
const constant = require('button-constant');
const fs = require('fs');
const officeToPdf = require('office-to-pdf');
const uuid4 = require('uuid/v4');
const officegen = require('officegen');
const { mongo } = require('./server');
const { getDocument } = require('./print');

/**
 * 查询onepage数据
 * @param projectId
 * @param format ppt/pdf
 * @param userId
 * @param res response object
 * @param req request object
 */
async function onepageppt(userId, projectId, format, res, req) {
  try {
    if (!projectId) {
      const message = 'no projectId';
      setResult(res, 400, { message });
      return;
    }
    const db = (await mongo).db('data');
    const productProjection = { name: 1, status: 1, license: 1 };
    const project = await db.collection('project')
      .findOne({ id: projectId });
    const product = await db.collection('product')
      .findOne({ projectId: project.id }, { projection: productProjection });
    if (project === null) {
      const message = `no project ${projectId}`;
      console.warn(message);
      setResult(res, 400, { permission: constant.PERMISSION.PERMISSION_TYPE.list });
      return;
    }
    const content = await onepageToPptx(project, product, req, res);
    switch (parseInt(format, 10)) {
      case constant.PRINT.FILE_FORMAT.pptx:
        await sendPptx(content, res);
        break;
      case constant.PRINT.FILE_FORMAT.pdf:
        await pptxTopdf(content, res);
        break;
      default:
        setResult(res, 400,
          { message: `type=${format} is not supported` });
        return;
    }
  } catch (e) {
    setError(res, 500, e);
  }
}

/**
 * 生成pptx文件
 *
 * @param project 项目数据
 * @param product 产品数据
 * @param res response object
 * @param req request object
 */
async function onepageToPptx(project, product, req) {
  let filename = '';
  if (project.banner !== '') {
    const filetypeArray = project.banner.match(/^https:\/\/buttondata.oss-cn-shanghai.aliyuncs.com\/.*\.(.*)/);
    if (filetypeArray) {
      filename = `${uuid4()}.${filetypeArray[1]}`;
      await getDocument(project.banner, filename, req);
    }
  }
  const pptx = officegen('pptx');
  pptx.setSlideSize(888, 499.5);
  const slide = pptx.makeNewSlide();
  // cx 宽度, cy 高度, 左上角为原点, (x, y)
  // 头部
  slide.addImage('./image/rightLogo.png', { cx: 55, cy: 35, x: 40, y: 30 });
  const textProject = { text: project.name, options: { font_size: 20, bold: true, char_spacing: 0.5, color: '404040' } };
  if (product) {
    slide.addText([
      textProject,
      {
        text: `  ——  ${product.name}`,
        options: { font_size: 24, char_spacing: 0.5, color: '808080', baseline: 10 },
      },
    ], { cx: '100%', cy: 60, x: 100, y: 27 });
  } else {
    slide.addText([textProject], { cx: '100%', cy: 60, x: 100, y: 27 });
  }
  // 左边
  slide.addImage('./image/border.png', { y: 100, x: 40, cy: 200, cx: 370 });
  slide.addImage('./image/logo.png', { cx: 110, cy: 110, x: 170, y: 140 });
  if (filename !== '') {
    slide.addImage(`./${filename}`, { y: 100, x: 40, cy: 200, cx: 370 });
  }
  const abstractHeight = textHeight(project.abstract, 1, false);
  slide.addText([{
    text: project.abstract,
    options: { font_size: 12, color: '404040', char_spacing: 0.5, spacing: 1.2 },
  }], { cx: '35%', cy: 60, x: 35, y: 320 });

  const address = project.address ? `${project.address.country} ${project.address.city}` : '保密';
  const askFor = project.askFor.amount ? `${project.askFor.unit} ${formatValue(project.askFor.amount)}` : '保密';
  const valuation = project.valuation.amount ? `${project.valuation.unit} ${formatValue(project.valuation.amount)}` : '保密';
  let later = '';
  if (askFor !== '保密' || valuation !== '保密') {
    later = `${project.askFor.unit}${formatValue(project.valuation.amount + project.askFor.amount)}`;
  }
  const laterValue = later || '保密';
  const str3 = `本轮：${askFor};  投前估值：${valuation};  投后估值：${laterValue}`;
  const keywordStyle = { font_size: 12, char_spacing: 0.5 };
  const contentStyle = { font_size: 12, color: '404040', char_spacing: 0.5 };
  slide.addText([{ text: '行业领域：', options: keywordStyle }, {
    text: project.keyword.join('; '),
    options: { font_size: 12, color: '404040' },
  }], { cx: '35%', cy: 60, x: 35, y: 380 + abstractHeight });
  slide.addText([{ text: '项目来源：', options: keywordStyle }, {
    text: address,
    options: { font_size: 12, color: '404040' },
  }], { cx: '35%', cy: 60, x: 35, y: 410 + abstractHeight });
  slide.addText([{ text: '融资阶段：', options: keywordStyle }], {
    cx: 100,
    cy: 60,
    x: 35,
    y: 440 + abstractHeight,
  });
  slide.addText([{ text: str3, options: contentStyle }], {
    cx: 320,
    cy: 60,
    x: 111,
    y: 440 + abstractHeight,
  });
  const license = '保密';
  const status = '保密';
  slide.addText([{ text: '产品阶段：', options: keywordStyle }, {
    text: license,
    options: { font_size: 12, color: '404040' },
  }], { cx: '35%', cy: 60, x: 35, y: 490 + abstractHeight });
  slide.addText([{ text: '销售情况：', options: keywordStyle }, {
    text: status,
    options: { font_size: 12, color: '404040' },
  }], { cx: '35%', cy: 60, x: 35, y: 520 + abstractHeight });
  // 右边
  slide.addImage('./image/button.png', { cx: 100, cy: 30, x: '86%', y: 30 });

  let text = {
    background: '',
    product: '',
    highlight: '',
    team: '',
  };
  if (project.detail.introduction) {
    try {
      text = JSON.parse(project.detail.introduction);
    } catch (e) {
      text.background = project.detail.introduction;
    }
  }
  const backgroundHeight = textHeight(text.background, 5, true);
  const productHeight = textHeight(text.product, 5, true);
  const highlightHeight = textHeight(text.highlight, 5, true);
  slide.addShape(pptx.shapes.RECTANGLE, { fill: '11487B', cx: 118, cy: 30, x: '40%', y: 100 });
  slide.addText('项目背景', {
    bold: true,
    font_size: 12,
    font_face: 'Microsoft YaHei',
    color: 'FFFFFF',
    cx: 125,
    cy: 35,
    x: 470,
    y: 101,
  });
  slide.addShape(pptx.shapes.RECTANGLE, {
    fill: 'F48E19',
    cx: 118,
    cy: 30,
    x: '40%',
    y: 225 + backgroundHeight,
  });
  slide.addText('项目产品', {
    bold: true,
    font_size: 12,
    font_face: 'Microsoft YaHei',
    color: 'FFFFFF',
    cx: 125,
    cy: 35,
    x: 470,
    y: 226 + backgroundHeight,
  });
  slide.addShape(pptx.shapes.RECTANGLE, {
    fill: '11487B',
    cx: 118,
    cy: 30,
    x: '40%',
    y: 350 + productHeight + backgroundHeight,
  });
  slide.addText('投资亮点', {
    bold: true,
    font_size: 12,
    font_face: 'Microsoft YaHei',
    color: 'FFFFFF',
    cx: 125,
    cy: 35,
    x: 470,
    y: 351 + productHeight + backgroundHeight,
  });
  slide.addShape(pptx.shapes.RECTANGLE, {
    fill: 'F48E19',
    cx: 118,
    cy: 30,
    x: '40%',
    y: 475 + highlightHeight + productHeight + backgroundHeight,
  });
  slide.addText('团队成员', {
    bold: true,
    font_size: 12,
    font_face: 'Microsoft YaHei',
    color: 'FFFFFF',
    cx: 125,
    cy: 35,
    x: 470,
    y: 476 + highlightHeight + productHeight + backgroundHeight,
  });

  slide.addText([{ text: text.background, options: contentStyle }], {
    cx: '45%',
    cy: 30,
    x: '52%',
    y: 94,
  });
  slide.addText([{ text: text.product, options: contentStyle }], {
    cx: '45%',
    cy: 30,
    x: '52%',
    y: 219 + backgroundHeight,
  });
  slide.addText([{ text: text.highlight, options: contentStyle }], {
    cx: '45%',
    cy: 30,
    x: '52%',
    y: 344 + productHeight + backgroundHeight,
  });
  slide.addText([{ text: text.team, options: contentStyle }], {
    cx: '45%',
    cy: 30,
    x: '52%',
    y: 471 + highlightHeight + productHeight + backgroundHeight,
  });
  slide.addText([{ text: 'confidential', options: contentStyle }], {
    cx: '35%',
    cy: 60,
    x: '90%',
    y: 600,
  });
  return { pptx, filename };
}

async function pptxTopdf(content, res) {
  const { pptx, filename } = content;
  const pptxName = `${uuid4()}.pptx`;
  const out = fs.createWriteStream(pptxName);
  if (filename !== '') {
    fs.unlink(filename, (err2) => {
      if (err2) {
        console.error(err2);
        return;
      }
      console.log(`${filename} is deleted`);
    });
  }
  pptx.generate(out);
  await out.on('close', () => {
    const wordBuffer = fs.readFileSync(pptxName);
    const pdfName = `${uuid4()}.pdf`;
    officeToPdf(wordBuffer).then(
      (pdfBuffer) => {
        fs.writeFileSync(pdfName, pdfBuffer);
      }, (err) => {
        console.log(err);
      });
    fs.unlink(pptxName, (err2) => {
      if (err2) {
        console.error(err2);
        return;
      }
      console.log(`${pptxName} is deleted`);
    });
    res.sendFile(`${__dirname}/${pdfName}`, null, (err1) => {
      if (err1) {
        console.error(err1);
      }
      // 删除pdf
      fs.unlink(pdfName, (err2) => {
        if (err2) {
          console.error(err2);
          return;
        }
        console.log(`${pdfName} is deleted`);
      });
    });
  });
}


/**
 * 转化格式并添加单位
 *
 * @param num 货币 数字类型
 */
function formatValue(num) {
  if (parseInt(num / 1000000000, 10)) {
    return `${(num / 1000000000).toFixed(2)
      .toLocaleString()} B`;
  } else if (parseInt(num / 1000000, 10)) {
    return `${((num / 1000000)).toFixed(2)
      .toLocaleString()} M`;
  } else if (parseInt(num / 1000, 10)) {
    return `${((num / 1000)).toFixed(2)
      .toLocaleString()} K`;
  }
}

/**
 * 计算板块高度
 *
 * @param lineString 每一板块数据字符
 * @param lineOffset：预设的行数
 * @param isRight 是否是右侧文档
 */
function textHeight(lineString, lineOffset, isRight) {
  let lineNum = 0;
  let englishLineNum = 54;
  let chineseLineNum = 25;
  if (isRight) {
    chineseLineNum = 35;
    englishLineNum = 65;
  }
  const list = lineString.split('\n');
  for (const line of list) {
    if (line !== '') {
      let rowNumber = 0;
      const isChinese = lineString.match(/[\u4e00-\u9faf]+/g); // 判断是否是中文
      if (isChinese === null) {
        rowNumber = Math.ceil(line.length / englishLineNum);
      } else {
        rowNumber = Math.ceil(line.length / chineseLineNum);
      }
      lineNum += rowNumber;
    }
  }
  const row = lineNum - lineOffset;
  const rowHeight = 17;
  const height = rowHeight * row;
  if (height > 0) {
    return height;
  }
  return 0;
}

/**
 * 生成pptx文件
 * @param content pptx
 * @param res response object
 */
async function sendPptx(content, res) {
  const name = `${uuid4()}.pptx`;
  const { pptx, filename } = content;
  // 以流的方式发送pptx文件
  res.writeHead(200, {
    'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'Content-disposition': `attachment; filename=${name}`,
  });
  pptx.generate(res);
  if (filename !== '') {
    fs.unlink(filename, (err2) => {
      if (err2) {
        console.error(err2);
        return;
      }
      console.log(`${filename} is deleted`);
    });
  }
  try {
    fs.unlink(name, (err2) => {
      if (err2) {
        return;
      }
      console.log(`${name} is deleted`);
    });
  } catch (e) {
    console.log(`${name} is already deleted`);
  }
}


module.exports = onepageppt;
