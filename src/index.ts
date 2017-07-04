import { GraphQLClient } from 'graphql-request'
import { FunctionEvent, GraphcoolOptions, ScalarObject, APIOptions, APIEndpoint } from './types'

export default class Graphcool {

  projectId: string
  pat: string
  serverEndpoint: string

  constructor(projectId: string, pat: string, options?: GraphcoolOptions) {
    const mergedOptions = {
      serverEndpoint: 'https://api.graph.cool',
      ...options,
    }

    this.projectId = projectId
    this.pat = pat
    this.serverEndpoint = mergedOptions.serverEndpoint.replace(/\/$/, '')
  }

  api(endpoint: APIEndpoint, options?: APIOptions): GraphQLClient {
    const url = `${this.serverEndpoint}/${endpoint}/${this.projectId}`
    return new GraphQLClient(url)
  }

  async generateAuthToken(nodeId: string, typeName: string, payload?: ScalarObject): Promise<string> {
    const request = `
      mutation {
        generateUserToken(input:{
          pat:"${this.pat}", 
          projectId:"${this.projectId}", 
          userId:"${nodeId}", 
          modelName:"${typeName}", 
          clientMutationId:"static"
        })
        {
          token
        }
      }`

    const result = await this.systemCLient().request(request)
    return result['token']
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

  private systemCLient() {
    const url = `${this.serverEndpoint}/system`
    return new GraphQLClient(url)
  }

}

export function fromEvent(event: FunctionEvent, options?: GraphcoolOptions): Graphcool {
  return new Graphcool(event.context.graphcool.projectId, event.context.graphcool.pat, options)
}
