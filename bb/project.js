const { mongo } = require('./server');
const { setResult, setError } = require('./utility');

/**
 * Fetches the basic information of a project.
 *
 * @param id id of the project
 * @param res response object
 */
/* eslint-disable prefer-destructuring */
async function getProject(id, res) {
  try {
    if (!id) {
      const message = `project ${id} is not valid`;
      console.error(message);
      setResult(res, 400, { message });
      return;
    }
    const db = (await mongo).db('data');
    // Check the permission for user and also public
    const query = { id };
    const projection = {
      id: 1,
      name: 1,
      stage: 1,
      keyword: 1,
      address: 1,
      abstract: 1,
      logo: 1,
      website: 1,
      time: 1,
      'detail.introduction': 1,
      askFor: 1,
      share: 1,
      valuation: 1,
      banner: 1,
    };
    const result = await db.collection('project').findOne(query, { projection });
    const product = await db.collection('product').findOne({ projectId: id }, { projection: { name: 1, license: 1, status: 1, _id: 0 } });
    let status = '';
    let license = [''];
    let productName = '';
    if (product) {
      status = product.status || '';
      if (product.license.length > 0) {
        license = product.license;
      }
      productName = product.name || '';
    }
    result.product = { status, license, name: productName };
    if (result === null) {
      const message = `no project ${id}`;
      console.warn(message);
      setResult(res, 400, { message });
      return;
    }
    const message = `project found as ${result.name}`;
    console.log(message);
    setResult(res, 200, { project: result });
  } catch (error) {
    setError(res, 500, error);
  }
}

module.exports = getProject;
