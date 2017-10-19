import { GraphQLClient } from 'graphql-request'
import {
  FunctionEvent,
  GraphcoolOptions,
  ScalarObject,
  APIOptions,
  APIEndpoint,
  Endpoints,
} from './types'
import { GraphQLSchema } from 'graphql'
import { makeRemoteExecutableSchema, introspectSchema } from 'graphql-tools'
import { HttpLink } from 'apollo-link-http'

export { FunctionEvent, GraphcoolOptions, APIOptions }

export default class Graphcool {
  serviceId: string
  token?: string
  endpoints: Endpoints

  constructor(serviceId: string, options?: GraphcoolOptions) {
    const mergedOptions = {
      token: undefined,
      ...options,
      endpoints: {
        simple: `https://api.graph.cool/simple/v1/${serviceId}`,
        relay: `https://api.graph.cool/relay/v1/${serviceId}`,
        system: `https://api.graph.cool/system`,
        subscriptions: `wss://subscriptions.graph.cool/v1/${serviceId}`,
        ...(options ? options.endpoints : {})
      },
    }

    this.endpoints = mergedOptions.endpoints
    this.serviceId = serviceId
    this.token = mergedOptions.token
  }

  getFullEndpoint(endpointKey: APIEndpoint = 'simple/v1') {
    return this.endpoints[endpointKey.split('/')[0]]
  }

  api(endpoint: APIEndpoint = 'simple/v1', options?: APIOptions): GraphQLClient {
    const url = this.getFullEndpoint(endpoint)
    const token = options && options.token ? options.token : this.token

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

  async generateAuthToken(nodeId: string, typeName: string): Promise<string> {
    this.checkRootTokenIsSet('generateNodeToken')

    const query = `
      mutation {
        generateNodeToken(input: {
          rootToken: "${this.token}"
          serviceId: "${this.serviceId}"
          nodeId: "${nodeId}"
          modelName: "${typeName}"
          clientMutationId: "static"
        }) {
          token
        }
      }
    `

    const result = await this.systemClient().request<{
      generateNodeToken: { token: string }
    }>(query)

    return result.generateNodeToken.token
  }
  async generateNodeToken(nodeId: string, typeName: string): Promise<string> {
    this.checkRootTokenIsSet('generateNodeToken')

    const query = `
      mutation {
        generateNodeToken(input: {
          rootToken: "${this.token}"
          serviceId: "${this.serviceId}"
          nodeId: "${nodeId}"
          modelName: "${typeName}"
          clientMutationId: "static"
        }) {
          token
        }
      }
    `

    const result = await this.systemClient().request<{
      generateNodeToken: { token: string }
    }>(query)

    return result.generateNodeToken.token
  }

  /** Returns an instance of the Simple API endpoint (based on graphql-tools) */
  async createSchema(): Promise<GraphQLSchema> {
    const link = new HttpLink({ uri: this.endpoints.simple, fetch })
    const schema = await introspectSchema(link)

    return makeRemoteExecutableSchema({ schema, link })
  }

  async validateToken(token: string): Promise<boolean> {
    throw new Error('Not implemented yet')
  }

  checkPermissionQuery(query: string, variables?: any): Promise<boolean> {
    throw new Error('Not implemented yet')
  }

  async updateAll(
    typeName: string,
    filter?: { [key: string]: any },
  ): Promise<any> {
    throw new Error('Not implemented yet')
  }

  async deleteAll(
    typeName: string,
    filter?: { [key: string]: any },
  ): Promise<any> {
    throw new Error('Not implemented yet')
  }

  private systemClient(): GraphQLClient {
    if (!this.endpoints.system) {
      throw new Error('Please provide the system endpoint')
    }
    return new GraphQLClient(this.endpoints.system)
  }

  private checkRootTokenIsSet(functionName: string): void {
    if (this.token == null) {
      throw new Error(
        `Graphcool must be instantiated with a rootToken when calling '${functionName}': new Graphcool('service-id', {token: 'rootToken'})`,
      )
    }
  }
}

export function fromEvent<T extends any>(
  event: FunctionEvent<T>,
  options?: GraphcoolOptions,
): Graphcool {
  return new Graphcool(
    event.context.graphcool.serviceId || event.context.graphcool.projectId!,
    {
      token: event.context.graphcool.rootToken,
      endpoints: event.context.graphcool.endpoints,
      ...options,
    },
  )
}
