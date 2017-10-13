import test from 'ava'
import { FunctionEvent, Context } from '../src/types'
import { fromEvent } from '../src/'
import * as fetchMock from 'fetch-mock'

test('fromEvent', async t => {
  const graphcool = fromEvent(testEvent)

  t.is(graphcool.serverEndpoint, 'https://api.graph.cool')
  t.is(graphcool.token, 'test-root-token')
})

test('api', async t => {
  const graphcool = fromEvent(testEvent)
  const api = graphcool.api('simple/v1')

  fetchMock.post(simpleApiEndpoint, { body: { data: { allCats: [{ id: 'cat-1' }] } }, headers: { 'Content-Type': 'application/json' } })
  const response = await api.request('{allCats{id}}')

  t.is(fetchMock.lastOptions().headers.Authorization, `Bearer ${testEvent.context.graphcool.token}`)
  t.deepEqual<any>(response, { allCats: [{ id: 'cat-1' }] })

  const apiWithCustomToken = graphcool.api('simple/v1', { token: 'custom-token' })
  await apiWithCustomToken.request('{allCats{id}}')

  t.is(fetchMock.lastOptions().headers.Authorization, `Bearer custom-token`)
})

test('generateNodeToken', async t => {
  const graphcool = fromEvent(testEvent)

  fetchMock.post(systemApiEndpoint, { body: { data: { generateNodeToken: { token: 'test-token' } } }, headers: { 'Content-Type': 'application/json' } })
  const response = await graphcool.generateNodeToken('test-node-id', 'TestType')

  t.is(response, 'test-token')
})

interface TestData {
  myBool: boolean
  myInt: number
}

const testEvent: FunctionEvent<TestData> = {
  data: {
    myBool: true,
    myInt: 7,
  },
  context: {
    request: {
      sourceIp: 'test-ip',
      headers: null,
      httpMethod: 'post'
    },
    graphcool: {
      token: 'test-root-token',
      serviceId: 'test-service-id',
      alias: 'test-alias'
    },
    environment: null,
    auth: {
      nodeId: 'test-node-id',
      typeName: 'test-type',
      token: 'test-node-token'
    },
    sessionCache: null
  }
}

const simpleApiEndpoint = 'https://api.graph.cool/simple/v1/test-service-id'
const systemApiEndpoint = 'https://api.graph.cool/system'
