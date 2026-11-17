padz::
    | 01 | stash    | score <- 0                                         |
    | 02 | stash    | time <- 60                                         |
    | 03 | stash    | gameover <- nopez                                  |
    | 04 | spit     | lookz:                                             |
        | 05 | sayz     | "Score: " + score                                  |
        | 06 | sayz     | "Time Left: " + time                               |
        | 07 | tapz     | "CLICK ME":                                        |
            | 08 | whenz    | tapz:                                              |
                | 09 | stash    | score <- score + 1                                 |
                | 10 | flipz    | lookz                                              |
            ::endz
    | 11 | whenz    | gameover == nopez:                                 |
        | 12 | spinzz   | every 1000 ms:                                     |
            | 13 | stash    | time <- time - 1                                   |
            | 14 | whenz    | time <= 0:                                         |
                | 15 | stash    | gameover <- yupz                                   |
                | 16 | spit     | sayz = "GAME OVER. FINAL SCORE: " + score          |
                | 17 | spit     | tapz = "RESTART":                                  |
                    | 18 | movez    | backz                                              |
                ::endz
            ::endz
        ::endz
    ::endz
::endz
