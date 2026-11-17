<:Canvas
    into<={"#open-live-widget"}
:>

    <:OPEN.LiveSource
        route<={widget.data.route}
        shell<={"trusted"}
        auth<={"server"}
    :>

        <:History
            limit<={30}
            skip<={"unpublish"}
        />

        <:Actions
            use<={"edit remix unpublish restore revision reload"}
            confirm<={"unpublish revision"}
        />

        <:Editor
            workspace<={"SourceGrid"}
            embedded
            lazy
            draggable
        />

        <:Realtime
            channel<={"PageForge.WS"}
            scope<={"route"}
            refresh<={"content source"}
        />

        <:Security
            sameOrigin
            isolateUploads
        />

    </:OPEN.LiveSource>

</:Canvas>
