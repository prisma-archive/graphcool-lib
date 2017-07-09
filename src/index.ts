import { GraphQLClient } from 'graphql-request'
import { FunctionEvent, GraphcoolOptions, ScalarObject, APIOptions, APIEndpoint } from './types'

export default class Graphcool {

  projectId: string
  pat?: string
  serverEndpoint: string

  constructor(projectId: string, options?: GraphcoolOptions) {
    const mergedOptions = {
      serverEndpoint: 'https://api.graph.cool',
      pat: undefined,
      ...options,
    }

    this.projectId = projectId
    this.pat = mergedOptions.pat
    this.serverEndpoint = mergedOptions.serverEndpoint.replace(/\/$/, '')
  }

  api(endpoint: APIEndpoint, options?: APIOptions): GraphQLClient {
    const url = `${this.serverEndpoint}/${endpoint}/${this.projectId}`
    return new GraphQLClient(url)
  }

  async generateAuthToken(nodeId: string, typeName: string, payload?: ScalarObject): Promise<string> {
    this.checkPatIsSet('generateAuthToken')

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

    const result = await this.systemClient().request(request)
    return result['generateUserToken']['token']
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

  private systemClient() {
    const url = `${this.serverEndpoint}/system`
    return new GraphQLClient(url)
  }

  private checkPatIsSet(fn: string) {
    if (this.pat == null) {
      throw new Error(`Graphcool must be instantiated with a pat when calling '${fn}': new Graphcool('project-id', {pat: 'pat'})`)
    }
  }
}

export function fromEvent(event: FunctionEvent, options?: GraphcoolOptions): Graphcool {
  return new Graphcool(event.context.graphcool.projectId, { pat: event.context.graphcool.pat, ...options })
}
