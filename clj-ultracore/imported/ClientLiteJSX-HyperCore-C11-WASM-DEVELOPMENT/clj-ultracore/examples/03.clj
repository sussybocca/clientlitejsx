R-CJS : Canvas

#open-live-widget <~ OPEN.LiveSource

route <~ widget.data.route

state <~ LiveSource.resolve(route)

history <~ state.history(30, skip:unpublish)

buttons <~ edit + remix + unpublish
          + restore + revision + reload

editor <~ SourceGrid(embedded, lazy)

movement <~ Drag(widget, editor, viewport)

updates <~ PageForge.WS(route)
          <~ Refresh(content, source)

approval <~ Confirm(unpublish, revision)

security <~ TrustedShell(sameOrigin, serverAuth, sandbox)

failure <~ Status(message, keepContent)

Render <~ LiveSource
