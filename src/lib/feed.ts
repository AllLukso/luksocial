import { Profile } from "@strandgeek/powerup";
import { keccak256, padLeft, numberToHex, AbiItem, fromAscii, hexToAscii, hexToNumber } from 'web3-utils'
import UniversalProfile from '@lukso/lsp-smart-contracts/artifacts/UniversalProfile.json';
import Web3 from "web3";
import { provider } from "web3-core"

interface Schema {
  name: string
  key: string
}

const encodeArrayKey = (key: string, index: number): string => {
  return key.slice(0, 34) + padLeft(numberToHex(index), 32).replace('0x', '');
}

const range = (start: number, end: number): number[] => {
  var ans = [];
  for (let i = start; i <= end; i++) {
      ans.push(i);
  }
  return ans;
}

const generateFeedSchema = (baseName: string, indexes: number[]): Schema[] => {
  const baseSchema: Schema = {
    name: `${baseName}[]`,
    key: keccak256(`${baseName}[]`),
  }
  const indexesSchema = indexes.map(index => ({
    name: `${baseName}[${index}]`,
    key: encodeArrayKey(baseSchema.key, index),
  })) as Schema[]
  return [
    baseSchema,
    ...indexesSchema,
  ]
}

interface FeedOptions {
  profile: Profile
  provider: provider
  pageSize: number
}

export class Feed {
  web3: Web3
  profile: Profile
  provider: provider;
  contract: any
  pageSize: number;

  constructor({ profile, provider, pageSize }: FeedOptions) {
    this.profile = profile
    this.provider = provider
    this.pageSize = pageSize
    this.web3 = new Web3(this.provider)
    this.contract = new this.web3.eth.Contract(
      UniversalProfile.abi as AbiItem[], this.profile.address)
  }

  private async setData(keys: string[], values: any[]) {
    return this.contract.methods
    ["setData(bytes32[],bytes[])"](keys, values)
      .send({
        from: this.profile.address,
      })
  }

  async getLength(): Promise<number> {
    const schema = generateFeedSchema('LuksocialFeed', [])
    const res = await this.contract.methods
    ["getData(bytes32[])"]([schema[0].key])
      .call({
        from: this.profile.address,
      })
    console.log(res)
    return hexToNumber(res[0])
  }

  async getItems({ page }: { page: number }): Promise<string[]> {
    const total = await this.getLength()
    const offset = page * this.pageSize
    let to = total - offset
    let from = to - this.pageSize
    if (from < 0) {
      from = 0
    }
    if (to > total) {
      to = total
    }
    const schema = generateFeedSchema('LuksocialFeed', range(from, to - 1))
    console.log(schema)
    schema.shift() // Remove base array (Array length) from schema
    console.log(schema)
    const res = await this.contract.methods
    ["getData(bytes32[])"](schema.map(s => s.key))
      .call({
        from: this.profile.address,
      })

    return res.map(hexToAscii)
  }

  async pushItem(text: string) {
    const length = await this.getLength()
    const schema = generateFeedSchema('LuksocialFeed', [length])
    await this.setData(schema.map(s => s.key), [length+1, fromAscii(text)])
  }
}
