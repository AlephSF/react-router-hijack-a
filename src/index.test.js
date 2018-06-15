import React from 'react'

import { shallow, mount } from 'enzyme'
import { Hijack } from './index'

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
  const e = { preventDefault: jest.fn() }

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
    expect(push).not.toHaveBeenCalled()
  })

  it('non-http protocol', () => {
    hijack.shouldRouterHandle('mailto:test@gmail.com', e)
    expect(push).not.toHaveBeenCalled()
  })
})