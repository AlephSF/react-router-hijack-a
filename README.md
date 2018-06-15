# React Router Hijack <a>

This React component allows React Router to handle raw HTML. It handles clicks
on its children, checks if an <a> tag was clicked, and determines whether to
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
