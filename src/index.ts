import { GraphQLClient } from 'graphql-request'
import { FunctionEvent, GraphcoolOptions, ScalarObject, APIOptions, APIEndpoint } from './types'

export class Graphcool {

  private pat: string
  private serverEndpoint: string

  constructor(pat: string, options?: GraphcoolOptions) {
    const mergedOptions = {
      serverEndpoint: 'https://api.graph.cool',
      ...options,
    }

    this.pat = pat
    this.serverEndpoint = mergedOptions.serverEndpoint.replace(/\/$/, '')
  }

  api(endpoint: Endpoint, options?: APIOptions): GraphQLClient {
    const url = `${this.serverEndpoint}/${endpoint}`
    return new GraphQLClient(url)
  }

  async generateAuthToken(nodeId: string, typeName: string, payload?: ScalarObject): Promise<string> {
    return ''
  }

  async validateToken(token: string): Promise<boolean> {
    return false
  }

  checkPermissionQuery(query: string, variables?: any): Promise<boolean> {
    throw new Error('Not implemented yet')
  }

  async updateAll(typeName: string, filter?: { [key: string]: any }): Promise<any> {
    throw new Error('Not implemented yet')
  }

  async deleteAll(typeName: string, filter?: { [key: string]: any }): Promise<any> {
    throw new Error('Not implemented yet')
  }

  async uploadFile(typeName: string, buffer: any): Promise<any> {
    throw new Error('Not implemented yet')
  }

}

export function fromEvent(event: FunctionEvent, options?: GraphcoolOptions): Graphcool {
  return new Graphcool(event.context.graphcool.pat, options)
}
