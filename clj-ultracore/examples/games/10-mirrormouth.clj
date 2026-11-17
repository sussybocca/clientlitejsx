⟪Z|D|A|P⟫
    ⟪H|S|A|T|S⟫ ← score <- 0
    ⟪H|S|A|T|S⟫ ← time <- 60
    ⟪H|S|A|T|S⟫ ← gameover <- nopez
    ⟪T|I|P|S⟫ ← lookz:
        ⟪Z|Y|A|S⟫ ← "Score: " + score
        ⟪Z|Y|A|S⟫ ← "Time Left: " + time
        ⟪Z|P|A|T⟫ ← "CLICK ME":
            ⟪Z|N|E|H|W⟫ ← tapz:
                ⟪H|S|A|T|S⟫ ← score <- score + 1
                ⟪Z|P|I|L|F⟫ ← lookz
            endz
    ⟪Z|N|E|H|W⟫ ← gameover == nopez:
        ⟪Z|Z|N|I|P|S⟫ ← every 1000 ms:
            ⟪H|S|A|T|S⟫ ← time <- time - 1
            ⟪Z|N|E|H|W⟫ ← time <= 0:
                ⟪H|S|A|T|S⟫ ← gameover <- yupz
                ⟪T|I|P|S⟫ ← sayz = "GAME OVER. FINAL SCORE: " + score
                ⟪T|I|P|S⟫ ← tapz = "RESTART":
                    ⟪Z|E|V|O|M⟫ ← backz
                endz
            endz
        endz
    endz
