// const env = process.env;
module.exports = {
  AccessKeyId: 'LTAIwtvIwVO4iiTB',
  AccessKeySecret: 'TZV63Uj9XhGyStWy0KKpyYqAuFHO3Z',
  RoleArn: 'acs:ram::5661292490684632:role/ooswrite',
  // 建议 Token 失效时间为 1 小时
  TokenExpireTime: '3600',
  PolicyFile: 'policy/writeOnly.txt',
};
