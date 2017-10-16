# graphcool-lib

## Install

```sh
yarn add graphcool-lib
```

## Usage


### Typescript
```ts
import { fromEvent, default as Graphcool, FunctionEvent } from 'graphcool-lib'

interface User {
  id: string
}

export default async (event: FunctionEvent) => {
  const lib: Graphcool = fromEvent(event)
  const client = lib.api('simple/v1')
  const {allUsers} = await client.request<{allUsers: User[]}>(`{allUsers{id}}`)

  return {
    data: {
      event: allUsers
    }
  }
}
```

### Javascript
```js
import { fromEvent } from 'graphcool-lib'

export default async event => {
  const lib = fromEvent(event)
  const client = lib.api('simple/v1')
  const {allUsers} = await client.request(`{allUsers{id}}`)

  return {
    data: {
      event: allUsers
    }
  }
}

```
