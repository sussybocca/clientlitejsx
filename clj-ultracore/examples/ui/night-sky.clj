.P.A.D.Z.:
    .S.T.Y.L.E.Z. = padz <- "background:#06132f;color:#ffffff;padding:30px;border-radius:22px;min-height:400px;max-width:720px;display:grid;gap:12px;font-family:system-ui"
    .S.T.Y.L.E.Z. = headz <- "color:#a4c5ff;font-size:32px;font-weight:800"
    .S.T.Y.L.E.Z. = sayz <- "background:#18316b;color:#ffffff;padding:16px;border-radius:12px;font-size:22px"
    .S.T.Y.L.E.Z. = tapz <- "background:#a4c5ff;color:#06132f;padding:14px;border-radius:10px;font-size:18px;font-weight:800;cursor:pointer"
    .S.P.I.T. = .H.E.A.D.Z. = "NIGHT SKY SCORE"


    // Set up the game state
    .S.T.A.S.H. = .S.C.O.R.E. <- 0
    .S.T.A.S.H. = .T.I.M.E. <- 60
    .S.T.A.S.H. = .G.A.M.E.O.V.E.R. <- .N.O.P.E.Z.

    // Render the UI
    .S.P.I.T. = .L.O.O.K.Z.:
        .S.A.Y.Z. = "Score: " + .S.C.O.R.E.
        .S.A.Y.Z. = "Time Left: " + .T.I.M.E.

        // The main button
        .T.A.P.Z. = "CLICK ME":
            .W.H.E.N.Z. = .T.A.P.Z.:
                // Every time you click, add to score
                .S.T.A.S.H. = .S.C.O.R.E. <- .S.C.O.R.E. + 1
                .F.L.I.P.Z. = .L.O.O.K.Z.
            .E.N.D.Z.

    // The timer loop
    .W.H.E.N.Z. = .G.A.M.E.O.V.E.R. == .N.O.P.E.Z.:
        .S.P.I.N.Z.Z. = .E.V.E.R.Y. 1000 .M.S.:
            .S.T.A.S.H. = .T.I.M.E. <- .T.I.M.E. - 1

            .W.H.E.N.Z. = .T.I.M.E. <= 0:
                .S.T.A.S.H. = .G.A.M.E.O.V.E.R. <- .Y.U.P.Z.
                .S.P.I.T. = .S.A.Y.Z. = "GAME OVER. FINAL SCORE: " + .S.C.O.R.E.
                .S.P.I.T. = .T.A.P.Z. = "RESTART":
                    .M.O.V.E.Z. = .B.A.C.K.Z.
                .E.N.D.Z.
            .E.N.D.Z.
        .E.N.D.Z.
    .E.N.D.Z.

.E.N.D.Z.
