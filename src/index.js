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
    // if it is an explicit non-http protocol, we want the browser to handle it natively
    // using history.push will do bad things
    const { protocols, hostnames } = this.props
    const nonHttpProtocol = protocols.some(protocol => url.startsWith(`${protocol}:`))
    if (nonHttpProtocol) { return }

    let destination = url

    // if it's http or protocol-relative, we need to check further
    // we want to use react router if it's sending us to the same domain
    const re = new RegExp('^(https?:)?//')
    const isHTTP = re.test(url)
    if (isHTTP) {
      const { hostname, pathname, search, hash } = this.getLocation(url)
      const sameSite = hostname === window.location.hostname || hostnames.indexOf(hostname) !== -1
      if (sameSite) {
        destination = pathname
        if (search) { destination += search }
        if (hash) { destination += hash }
      } else {
        // if it's an external http url, we let the browser handle it natively
        return
      }
    }

    // in all other cases (query string, hash fragment, relative URL)
    // we directly push the url and React Router will handle it correctly
    this.props.history.push(destination)
    event.preventDefault()
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
        const target = el.getAttribute('target')
        if (target && target !== '_self' && target !== window.name) { return }
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

Hijack.defaultProps = {
  protocols: [ 'mailto', 'tel' ],
  hostnames: []
}

Hijack.propTypes = {
  children: PropTypes.node.isRequired,
  history: PropTypes.object.isRequired,
  protocols: PropTypes.arrayOf(PropTypes.string).isRequired,
  hostnames: PropTypes.arrayOf(PropTypes.string).isRequired
}

export default withRouter(Hijack)
