import { GraphQLClient } from 'graphql-request'
import { FunctionEvent, GraphcoolOptions, ScalarObject, APIOptions, APIEndpoint } from './types'
import { GraphQLSchema } from 'graphql'
import { makeRemoteExecutableSchema, introspectSchema } from 'graphql-tools'
import { HttpLink } from 'apollo-link-http'

export default class Graphcool {

  serviceId: string
  rootToken?: string
  serverEndpoint: string

  constructor(serviceId: string, options?: GraphcoolOptions) {
    const mergedOptions = {
      serverEndpoint: 'https://api.graph.cool',
      rootToken: undefined,
      ...options,
    }

    this.serviceId = serviceId
    this.rootToken = mergedOptions.rootToken
    this.serverEndpoint = mergedOptions.serverEndpoint.replace(/\/$/, '')
  }

  api(endpoint: APIEndpoint, options?: APIOptions): GraphQLClient {
    const url = `${this.serverEndpoint}/${endpoint}/${this.serviceId}`
    const token = (options && options.token) ? options.token : this.rootToken

    if (token) {
      return new GraphQLClient(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
    } else {
      return new GraphQLClient(url)
    }
  }

  // TODO implement deprecated fallback `generateAuthToken`

  async generateNodeToken(nodeId: string, typeName: string, payload?: ScalarObject): Promise<string> {
    this.checkRootTokenIsSet('generateNodeToken')

    const query = `
      mutation {
        generateNodeToken(input: {
          rootToken: "${this.rootToken}"
          serviceId: "${this.serviceId}"
          nodeId: "${nodeId}", 
          modelName: "${typeName}", 
          clientMutationId: "static"
        }) {
          token
        }
      }
    `

    const result = await this.systemClient().request<{generateNodeToken: { token: string }}>(query)

    return result.generateNodeToken.token
  }

  /** Returns an instance of the Simple API endpoint (based on graphql-tools) */
  async createSchema(): Promise<GraphQLSchema> {
    const endpoint = `https://api.graph.cool/simple/v1/${this.serviceId}`
    const link = new HttpLink({ uri: endpoint, fetch })
    const schema = await introspectSchema(link)

    return makeRemoteExecutableSchema({ schema, link })
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

  private systemClient(): GraphQLClient {
    return new GraphQLClient(`${this.serverEndpoint}/system`)
  }

  private checkRootTokenIsSet(fn: string) {
    if (this.rootToken == null) {
      throw new Error(`Graphcool must be instantiated with a rootToken when calling '${fn}': new Graphcool('service-id', {token: 'rootToken'})`)
    }
  }
}

export function fromEvent<T extends any>(event: FunctionEvent<T>, options?: GraphcoolOptions): Graphcool {
  return new Graphcool(event.context.graphcool.serviceId, { rootToken: event.context.graphcool.rootToken, ...options })
}
