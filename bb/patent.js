const fetch = require('node-fetch');
const { setResult, setError } = require('./utility');
const { mongo } = require('./server');
const moment = require('moment');

const BASE_URL = 'http://www.patentsview.org/api/patents/query';
const PROJECTION = [
  'patent_title',
  'patent_number',
  'patent_type',
  'patent_year',
  'patent_kind',
  'patent_num_combined_citations',
  'patent_date',
  'patent_abstract',
  'assignee_id',
  'assignee_type',
  'assignee_first_name',
  'assignee_last_name',
  'assignee_organization',
  'assignee_state',
  'assignee_city',
  'assignee_country',
  'inventor_id',
  'inventor_first_name',
  'inventor_last_name',
  'inventor_state',
  'inventor_city',
  'inventor_country'];
const PAGINATION = {
  per_page: 100,
  page: 1,
};

function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }
  const message = `请求错误 ${response.status}: ${response.url}`;
  console.error(response);
  const error = new Error(`请求错误 ${response.status}: ${response.url}`);
  error.name = message;
  error.response = response;
  throw error;
}

/**
 * Queries mongodb for patents.
 *
 * @param query query for the patent
 * @param res response object
 */
// eslint-disable-next-line no-unused-vars
async function queryPatentFromMongo(query, res) {
  try {
    const db = (await mongo).db('data');
    const result = await db.collection('patent').find(query, null).toArray();
    if (result === null) {
      const message = 'no such patent';
      console.error(message);
      setResult(res, 400, { message });
      return;
    }
    setResult(res, 200, { body: result });
  } catch (error) {
    setError(res, 500, error);
  }
}

/**
 * Updates the patents to the mongodb.
 *
 * @param projectId id of the project
 * @param patents patents from the api
 */
async function updatePatentToMongo(projectId, patents, res) {
  try {
    const db = (await mongo).db('data');
    const results = [];
    if (!patents) {
      return;
    }
    const operations = patents.map((patent) => {
      const uuid5 = require('uuid/v5');
      // eslint-disable-next-line camelcase
      const { patent_number, patent_title, patent_abstract, patent_date } = patent;
      const id = uuid5(patent_number, uuid5.URL);
      const document = {
        id,
        title: patent_title,
        abstract: patent_abstract,
        time: moment(patent_date).unix(),
        targetId: projectId,
        type: 1, // 1 for project, 0 for user.
        detail: patent,
        credit: 0,
      };
      results.push(document);
      return {
        updateOne: {
          filter: { id },
          update: { $set: document },
          upsert: true,
        },
      };
    });
    return await db.collection('patent').bulkWrite(operations);
  } catch (error) {
    setError(res, 500, error);
  }
}

/**
 * Searches for the patents.
 *
 * @param projectId the id of the patent assignee, which should be a project
 * @param term query applied for the searching. It should be an array of strings.
 *   the query will be treated as OR
 * @param res response object
 * @param page page to look for. 100 results per page.
 */
module.exports = async function queryPatent(projectId, term, res, page = undefined) {
  try {
    // eslint-disable-next-line no-unused-vars
    const pagination = page ?
      { page, per_page: PAGINATION.per_page } :
      PAGINATION;
    // build the query
    const query = { q: {}, f: PROJECTION, o: PAGINATION };
    if (!Array.isArray(term)) {
      const message = `query is expected to be an array of strings, but get ${query}`;
      console.error(message);
      setResult(res, 400, { message });
      return;
    }
    if (term.length > 1) {
      query.q = { _or: term.map(q => ({ assignee_organization: q })) };
    } else {
      query.q = { assignee_organization: term[0] };
    }
    // Apply the query
    // eslint-disable-next-line compat/compat
    const response = await fetch(BASE_URL,
      { method: 'POST', body: JSON.stringify(query) });
    checkStatus(response);
    const result = await response.json();
    const mongoResult = await updatePatentToMongo(projectId, result.patents, res);
    if (!mongoResult) {
      setResult(res, 400, { message: 'no such patent' });
      return;
    }
    setResult(res, 200, { _items: result.patents });
  } catch (error) {
    setError(res, 500, error);
  }
};
