[P>A>D>Z] => {
    [S>T>A>S>H] : score <- 0
    [S>T>A>S>H] : time <- 60
    [S>T>A>S>H] : gameover <- nopez
    [S>P>I>T] : lookz:
        [S>A>Y>Z] : "Score: " + score
        [S>A>Y>Z] : "Time Left: " + time
        [T>A>P>Z] : "CLICK ME":
            [W>H>E>N>Z] : tapz:
                [S>T>A>S>H] : score <- score + 1
                [F>L>I>P>Z] : lookz
            endz
    [W>H>E>N>Z] : gameover == nopez:
        [S>P>I>N>Z>Z] : every 1000 ms:
            [S>T>A>S>H] : time <- time - 1
            [W>H>E>N>Z] : time <= 0:
                [S>T>A>S>H] : gameover <- yupz
                [S>P>I>T] : sayz = "GAME OVER. FINAL SCORE: " + score
                [S>P>I>T] : tapz = "RESTART":
                    [M>O>V>E>Z] : backz
                endz
            endz
        endz
    endz
}
