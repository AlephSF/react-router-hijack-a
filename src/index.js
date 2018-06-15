import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import PropTypes from 'prop-types'

export class Hijack extends Component {
  getLocation (href) {
    // eslint-disable-next-line no-useless-escape
    const re = /^(https?\:)?\/\/(([^:\/?#]*)(?:\:([0-9]+))?)([\/]{0,1}[^?#]*)(\?[^#]*|)(#.*|)$/
    const match = href.match(re)
    const location = match && {
      href: href,
      protocol: match[1],
      host: match[2],
      hostname: match[3],
      port: match[4],
      pathname: match[5],
      search: match[6],
      hash: match[7]
    }
    return match && location
  }

  shouldRouterHandle (url, event) {
    // if the href is a query string, we handle it with react router
    if (url[0] === '?') {
      this.props.history.push(url)
      event.preventDefault()
      return
    }

    // if it's http or protocol-relative, we need to check further
    // we want to use react router if it's sending us to the same domain
    const re = new RegExp('^(https?:)?//')
    const isHTTP = re.test(url)
    if (isHTTP) {
      const { hostname, pathname, search, hash } = this.getLocation(url)
      if (window.location.hostname === hostname) {
        let destination = pathname
        if (search) { destination += search }
        if (hash) { destination += hash }
        this.props.history.push(destination)
        event.preventDefault()
      }
    }

    // in all other cases (non-http protocol, hash fragment, external http url)
    // we let the browser handle it natively
  }

  onClick = event => {
    // if the user is trying to right click or open the link in a new tab or window
    // we do not want to interfere
    const { ctrlKey, shiftKey, metaKey } = event
    if (ctrlKey || shiftKey || metaKey) {
      return
    }

    // when Hijack is clicked, we look at the target and each of the target's parents
    // if an <a> tag was clicked, we process it further
    const self = event.currentTarget
    for (let el = event.target; el !== self; el = el.parentElement) {
      if (el.nodeName === 'A') {
        const href = el.getAttribute('href')
        href && this.shouldRouterHandle(href, event)
        break
      }
    }
  }

  render () {
    return <div onClick={this.onClick}>
      {this.props.children}
    </div>
  }
}

Hijack.propTypes = {
  children: PropTypes.node,
  history: PropTypes.object.isRequired
}

export default withRouter(Hijack)
