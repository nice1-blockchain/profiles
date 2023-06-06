import { ChainTester } from 'chaintester'

let tester = new ChainTester()

beforeEach(async () => {
    await tester.init()
    await tester.deployContract('hello', './assembly/profiles/profiles.wasm', './assembly/profiles/profiles.abi')
})

afterEach(async () => {
    await tester.free()
})

it('works calling update with all params', async () => {
    let ret = await tester.pushAction('hello', 'update', {
        user: 'hello',
        alias: 'testing',
        avatar: 'https://testing.com',
    }, {'hello': 'active'})
    expect(ret.except).toBeUndefined()
})

it('works calling update only with alias or avatar params', async () => {
    let ret = await tester.pushAction('hello', 'update', {
        user: 'hello',
        alias: 'testing',
        avatar: '',
    }, {'hello': 'active'})
    expect(ret.except).toBeUndefined()

    await tester.produceBlock()

    ret = await tester.pushAction('hello', 'update', {
        user:'hello',
        alias: '',
        avatar: 'https://testing.com'
    }, {'hello': 'active'})
    expect(ret.except).toBeUndefined()
    await tester.produceBlock()
})

it('returns error if sending incorrect avatar', async () => {
    const ret = await tester.pushAction('hello', 'update', {
        user: 'hello',
        alias: '',
        avatar: 'incorrect',
    }, {'hello': 'active'})
    const { stack } : { stack : any[] } = (ret.except as any)
    const errormsg = stack.filter((s: any) => s.context.level === 'error').pop().data.s

    expect(errormsg).not.toBeUndefined()
    expect(errormsg).toMatch(/^Avatar has to be either/)
})


it('returns error if sending incorrect alias', async () => {
    const ret = await tester.pushAction('hello', 'update', {
        user: 'hello',
        alias: 'alias?alias?alias?',
        avatar: 'https://testing.com',
    }, {'hello': 'active'})
    const { stack } : { stack : any[] } = (ret.except as any)
    const errormsg = stack.filter((s: any) => s.context.level === 'error').pop().data.s

    expect(errormsg).not.toBeUndefined()
    expect(errormsg).toMatch(/^Alias must be less than/)
})