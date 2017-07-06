import test from 'ava'
import { FunctionEvent, Context } from '../src/types'
import { fromEvent } from '../src/'
import * as fetchMock from 'fetch-mock'

test('fromEvent', async t => {
  const graphcool = fromEvent(testEvent)

  t.is(graphcool.serverEndpoint, 'https://api.graph.cool')
  t.is(graphcool.pat, 'test-pat')
})

test('api', async t => {
  const graphcool = fromEvent(testEvent)
  const api = graphcool.api('simple/v1')

  fetchMock.post(simpleApiEndpoint, {body:{data: {allCats: [{id: 'cat-1'}]}}, headers: {'Content-Type': 'application/json'}})
  const response = await api.request('{allCats{id}}')

  console.log(response)

  t.deepEqual<any>(response, {allCats: [{id: 'cat-1'}]})
})

test('generateAuthToken', async t => {
  const graphcool = fromEvent(testEvent)

  fetchMock.post(systemApiEndpoint, {body:{data: {token: 'test-token'}}, headers: {'Content-Type': 'application/json'}})
  const response = await graphcool.generateAuthToken('test-node-id', 'TestType')

  console.log(response)

  t.is(response, 'test-token')
})

const testEvent: FunctionEvent = {
  data: {
    boolean: true,
    int: 7
  },
  context: {
    request: {
      sourceIp: 'test-ip',
      headers: null,
      httpMethod: 'post'
    },
    graphcool: {
      pat: "test-pat",
      projectId: 'test-project-id',
      alias: 'test-alias'
    },
    environment: null,
    auth: {
      nodeId: 'test-node-id',
      typeName: 'test-type',
      token: 'test-token'
    },
    sessionCache: null
  }
}

const simpleApiEndpoint = 'https://api.graph.cool/simple/v1/test-project-id'
const systemApiEndpoint = 'https://api.graph.cool/system'