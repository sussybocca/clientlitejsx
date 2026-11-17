#root <~ padz <~ spit
    stash <~ score <- 0
    stash <~ time <- 60
    stash <~ gameover <- nopez
    spit <~ lookz:
        sayz <~ "Score: " + score
        sayz <~ "Time Left: " + time
        tapz <~ "CLICK ME":
            whenz <~ tapz:
                stash <~ score <- score + 1
                flipz <~ lookz
            endz
    whenz <~ gameover == nopez:
        spinzz <~ every 1000 ms:
            stash <~ time <- time - 1
            whenz <~ time <= 0:
                stash <~ gameover <- yupz
                spit <~ sayz = "GAME OVER. FINAL SCORE: " + score
                spit <~ tapz = "RESTART":
                    movez <~ backz
                endz
            endz
        endz
    endz
