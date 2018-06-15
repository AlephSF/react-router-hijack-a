# React Router Hijack <a>

This React component allows React Router to handle raw HTML. It handles clicks
on its children, checks if an `<a>` tag was clicked, and determines whether to
process it as an internal react-router link or an external link.

## Usage

```jsx
import Hijack from '@aleph/react-router-hijack-a'

<Hijack>
  <div dangerouslySetInnerHTML={{ __html: `
    <a href='https://www.test.com'>internal link</a>
    <a href='https://www.google.com'>external link</a>
  ` }} />
</Hijack>
```

## Props

The component accepts a `protocols` prop, which is a list of protocols that
should be handled natively by the browser. By default, the component only
expects `'mailto'` and `'tel'` protocols, so less common protocols such as
`'ftp'` will be handled incorrectly. Simply add any necessary protocols like so:

```jsx
import Hijack from '@aleph/react-router-hijack-a'

<Hijack protocols={[ 'other' ]}>
  <div dangerouslySetInnerHTML={{ __html: `
    <a href='mailto:ping@alephsf.com'>email</a>
    <a href='other://example'>other protocol</a>
  ` }} />
</Hijack>
```
