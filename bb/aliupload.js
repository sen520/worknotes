const conf = require('./config');
const OSS = require('ali-oss');
const uuid4 = require('uuid/v4');
const crypto = require('crypto');
const request = require('request');
const { setResult } = require('./utility');

const client = new OSS({
  endpoint: 'https://oss-cn-shanghai.aliyuncs.com',
  accessKeyId: 'LTAIwtvIwVO4iiTB',
  accessKeySecret: 'TZV63Uj9XhGyStWy0KKpyYqAuFHO3Z',
  bucket: 'buttondata',
  secure: true,
});
const mime = require('mime-types');

function getPolicy(res) {
  const end = new Date().getTime() + 300000;
  const expiration = new Date(end).toISOString();
  let policyString = {
    expiration,
    conditions: [
      ['content-length-range', 0, 64000000],
      ['starts-with', '$key', ''],
    ],
  };
  policyString = JSON.stringify(policyString);
  // eslint-disable-next-line no-buffer-constructor
  const policy = new Buffer(policyString).toString('base64');
  const signature = crypto.createHmac('sha1', conf.AccessKeySecret)
    .update(policy).digest('base64');
  res.json({
    OSSAccessKeyId: conf.AccessKeyId,
    host: 'https://buttondata.oss-cn-shanghai.aliyuncs.com',
    policy,
    signature,
    saveName: uuid4(),
    startsWith: '',
  });
}

function getFile(url, res) {
  const end = new Date().getTime() + 300000;
  const expiration = new Date(end).toISOString();
  let policyString = {
    expiration,
    conditions: [
      ['content-length-range', 0, 20000000],
      ['starts-with', '$key', ''],
    ],
  };
  policyString = JSON.stringify(policyString);
  // eslint-disable-next-line no-buffer-constructor
  const policy = new Buffer(policyString).toString('base64');
  const signature = crypto.createHmac('sha1', conf.AccessKeySecret)
    .update(policy).digest('base64');
  request(
    `https://buttondata.oss-cn-shanghai.aliyuncs.com/${encodeURIComponent(url)}`,
    {
      headers: {
        authorization: signature,
      },
    }).pipe(res);
}

/**
 * uploads a file.
 *
 * @param filename can be null
 * @param mimeType mime type
 * @param content buffer representing the file
 */
async function upload(filename, mimeType, content) {
  let name = null;
  if (!filename) {
    name = `${uuid4()}.${mime.extension(mimeType)}`;
  } else {
    name = `${uuid4().substr(0, 6)}-${filename}`;
  }
  const result = await client.put(name, content);
  if (result.res.status !== 200) {
    console.error(`fails to upload ${name} as ${result.url}`);
    return null;
  }
  return result.url;
}

/**
 * delete a file.
 *
 * @param filename string or array 阿里云上的文件名
 *    例如: 文件名Jingxuan069[B1].jpg  =>  阿里云上的1f868d-Jingxuan069%5B1%5D.jpg
 * @param res response object
 */
async function deleteFile(filename, res) {
  const errorMessage = `the ${filename} failed deleted`;
  const correctMessage = `the ${filename} deleted success`;
  try {
    let nameList = [];
    if (!Array.isArray(filename)) {
      nameList.push(filename);
    } else {
      nameList = filename;
    }
    nameList = nameList.map((value) => { return decodeURI(value); });
    const result = await client.deleteMulti(nameList);
    if (String(result.res.statusCode).match(/^2.*/)) {
      setResult(res, 200, { correctMessage });
      return;
    }
    setResult(res, 500, { errorMessage });
  } catch (e) {
    setResult(res, 500, { errorMessage });
  }
}

module.exports = {
  getPolicy,
  upload,
  getFile,
  deleteFile,
};
