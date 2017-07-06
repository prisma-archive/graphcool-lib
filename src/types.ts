export interface GraphcoolOptions {
  serverEndpoint?: string // by default: 'https://api.graph.cool'
  pat?: string
}

export interface FunctionEvent {
  data: any
  context: Context
}

export interface Context {
  request: RequestContext
  graphcool: GraphcoolContext
  environment: any
  auth: AuthContext
  sessionCache: any
}

export interface RequestContext {
  sourceIp: string
  headers: any
  httpMethod: 'post' | 'put'
}

export interface GraphcoolContext {
  pat: string
  projectId: string
  alias: string
  // region: 'eu-west-1' | 'us-west-2'
  // serverEndpoint: string
}

export interface AuthContext {
  nodeId: string
  typeName: string
  token: string
}

export interface ScalarObject {
  [key: string]: ScalarOrScalarObject
}

export type ScalarOrScalarObject = ScalarObject | number | string | boolean

export interface APIOptions {
  token?: string
}

export type APIEndpoint = 'simple/v1' | 'relay/v1' | 'system'
