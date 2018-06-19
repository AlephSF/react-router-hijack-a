import React from 'react'

import { shallow, mount } from 'enzyme'
import { Hijack } from './index'

const e = { preventDefault: jest.fn() }

describe('basic rendering', () => {
  it('should render children when passed in', () => {
    const wrapper = shallow(
      <Hijack history={jest.mock()}>
        <div className='tester' />
      </Hijack>
    )
    const actual = wrapper.contains(<div className='tester' />)
    expect(actual).toBe(true)
  })
})

describe('using <a> tags as wrappers', () => {
  it('should process an <a> tag when its child is clicked', () => {
    const wrapper = mount(
      <Hijack history={jest.mock()}>
        <a href='/internal'>
          <div id='inner' />
        </a>
      </Hijack>
    )
    const shouldRouterHandle = jest.fn()
    wrapper.instance().shouldRouterHandle = shouldRouterHandle
    wrapper.find('#inner').simulate('click')
    expect(shouldRouterHandle).toHaveBeenCalled()
  })
})

describe('href handling', () => {
  let hijack
  let push

  beforeEach(() => {
    push = jest.fn()
    hijack = shallow(
      <Hijack history={{ push }}>
        <div className='tester' />
      </Hijack>
    ).instance()
  })

  it('http (external)', () => {
    hijack.shouldRouterHandle('https://external.com', e)
    expect(push).not.toHaveBeenCalled()
  })

  it('http (internal)', () => {
    hijack.shouldRouterHandle('http://www.test.com/x', e)
    expect(push).toHaveBeenCalledWith('/x')
  })

  it('http (internal) with hash and query', () => {
    hijack.shouldRouterHandle('http://www.test.com?q=x#fragment', e)
    expect(push).toHaveBeenCalledWith('?q=x#fragment')
  })

  it('protocol-relative (external)', () => {
    hijack.shouldRouterHandle('//external.com', e)
    expect(push).not.toHaveBeenCalled()
  })

  it('protocol-relative (internal)', () => {
    hijack.shouldRouterHandle('//www.test.com', e)
    expect(push).toHaveBeenCalledWith('')
  })

  it('query-string only', () => {
    hijack.shouldRouterHandle('?q=test', e)
    expect(push).toHaveBeenCalledWith('?q=test')
  })

  it('hash-fragment only', () => {
    hijack.shouldRouterHandle('#anchor', e)
    expect(push).toHaveBeenCalledWith('#anchor')
  })

  it('expected non-http protocol', () => {
    hijack.shouldRouterHandle('mailto:test@gmail.com', e)
    expect(push).not.toHaveBeenCalled()
  })

  it('unexpected non-http protocol', () => {
    hijack.shouldRouterHandle('test://example', e)
    expect(push).toHaveBeenCalled()
  })
})

describe('protocol prop handling', () => {
  it('default protocol', () => {
    const push = jest.fn()
    const hijack = shallow(
      <Hijack history={{ push }}>
        <div className='tester' />
      </Hijack>
    ).instance()
    hijack.shouldRouterHandle('mailto:test@gmail.com', e)
    expect(push).not.toHaveBeenCalled()
  })

  it('custom protocol overrides defaults', () => {
    const push = jest.fn()
    const hijack = shallow(
      <Hijack protocols={[ 'test' ]} history={{ push }}>
        <div className='tester' />
      </Hijack>
    ).instance()
    hijack.shouldRouterHandle('test://example', e)
    expect(push).not.toHaveBeenCalled()
    hijack.shouldRouterHandle('mailto:test@gmail.com', e)
    expect(push).toHaveBeenCalledWith('mailto:test@gmail.com')
  })
})

describe('hostname prop handling', () => {
  it('approves of listed hostnames', () => {
    const push = jest.fn()
    const hijack = shallow(
      <Hijack hostnames={[ 'www.test.com', 'test.com' ]} history={{ push }}>
        <div className='tester' />
      </Hijack>
    ).instance()
    hijack.shouldRouterHandle('https://test.com/page', e)
    expect(push).toHaveBeenCalledWith('/page')
  })
})
