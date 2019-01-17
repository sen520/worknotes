const fetch = require('node-fetch');
const querystring = require('querystring');
const crypto = require('crypto');
const { promisify } = require('util');
const { setResult } = require('./utility');
const { redisTranslate } = require('./server');
const config = require('./config.json');

const getAsync = promisify(redisTranslate.get).bind(redisTranslate);

/**
 * 有道翻译
 *
 * @param text 需要翻译的文本
 * @param res response object
 * @param from 需要翻译的文本语言
 * @param to 目标语言
 */
/* eslint-disable compat/compat */
async function translate(text, res, fromLanguage, toLanguage) {
  const from = fromLanguage || 'auto';
  const to = toLanguage || 'auto';
  let textList = [];
  let isChinese = false;
  if (text.length >= 4500) {
    if (text.match(/[\u4e00-\u9faf]+/)) {
      isChinese = true;
      textList = text.split('。');
    } else {
      textList = text.split('.');
    }
  } else {
    textList = [text];
  }
  const requestUrl = 'https://openapi.youdao.com/api';

  const resultList = [];
  /* eslint-disable no-await-in-loop */
  for (const textString of textList) {
    const result = await sendTranslate(textString, requestUrl, from, to);
    if (result === '') {
      resultList.push(textString);
    } else {
      resultList.push(result);
    }
  }
  let result = '';
  if (isChinese) {
    result = resultList.join('.');
  } else {
    result = resultList.join('。');
  }
  setResult(res, 200, { result });
}

async function sendTranslate(textString, requestUrl, from, to) {
  const textStringHash = md5Sign(textString);
  const redisResult = await getAsync(textStringHash);
  if (redisResult) {
    return redisResult;
  }
  const { appKey } = config.youdao;
  const { secret } = config.youdao;
  const salt = Math.random(9999);
  const sign = md5Sign(appKey + textString + salt + secret);
  const body = {
    q: textString, // 要翻译的文本 UTF-8
    from, // 源语言 (可设置为auto)
    to, // 目标语言 (可设置为auto)
    appKey,
    salt, // 随机数
    sign,
  };
  try {
    if (textString === '') return '';
    const url = `${requestUrl}?${querystring.stringify(body)}`;
    const result = await fetch(url);
    const info = await result.json();
    if (!info.translation) {
      return '';
    }
    const stringHash = md5Sign(textString);
    await redisTranslate.set(stringHash, info.translation[0]);
    return info.translation[0];
  } catch (e) {
    return '';
  }
}


/**
 * 字符串转md5
 *
 * @param text 需要md5的字符串
 */
function md5Sign(text) {
  return crypto.createHash('md5').update(text).digest('hex');
}


module.exports = translate;
