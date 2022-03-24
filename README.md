# NPM Ensure Id

Ensures that all specified html elements has id attribute.

Example
```
ensureId({
check: 'id',
elements : [
    'a',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'table',
    'tbody',
    'thead',
    'md-table-container',
    'button',
],
attrs: [],
autofix: true,
platform: 'web'
}, 'filepath');
```

NPM variant of https://github.com/ezraroi/grunt-ensure-id
