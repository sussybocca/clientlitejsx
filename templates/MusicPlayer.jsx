// @clj-animate sphereWave3D

function MusicPlayer() {
  const [playlist, setPlaylist] = __CLJ_useState([
    { id: 1, title: 'Quantum Dreams', artist: '4D Artist', duration: '3:45', playing: false },
    { id: 2, title: 'Hyperdrive', artist: 'Neon Pulse', duration: '4:20', playing: false },
    { id: 3, title: 'Dimensional Rift', artist: 'Cosmic Wave', duration: '5:10', playing: false },
    { id: 4, title: 'Quantum Entanglement', artist: 'Synth Lord', duration: '3:55', playing: false },
    { id: 5, title: '4th Dimension', artist: 'Future Beats', duration: '4:45', playing: false }
  ]);
  const [currentTrack, setCurrentTrack] = __CLJ_useState(null);
  const [isPlaying, setIsPlaying] = __CLJ_useState(false);
  const [volume, setVolume] = __CLJ_useState(70);
  const [progress, setProgress] = __CLJ_useState(0);

  const playTrack = (track) => {
    setPlaylist(playlist.map(t => ({ ...t, playing: t.id === track.id })));
    setCurrentTrack(track);
    setIsPlaying(true);
    if (typeof CLJ !== 'undefined') CLJ.Toast.show(`🎵 Now playing: ${track.title}`, 2000);
    
    let prog = 0;
    const interval = setInterval(() => {
      prog += 1;
      setProgress(prog);
      if (prog >= 100) {
        clearInterval(interval);
        setIsPlaying(false);
        setProgress(0);
        const nextIndex = playlist.findIndex(t => t.id === track.id) + 1;
        if (nextIndex < playlist.length) playTrack(playlist[nextIndex]);
      }
    }, 2000);
    return () => clearInterval(interval);
  };

  const pauseTrack = () => {
    setIsPlaying(false);
    setPlaylist(playlist.map(t => ({ ...t, playing: false })));
    if (typeof CLJ !== 'undefined') CLJ.Toast.show('⏸️ Paused', 1500);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div className="clj-glass" style={{ maxWidth: '500px', width: '100%', padding: '30px', borderRadius: '30px' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ fontSize: '60px' }}>🎵</div>
          <h1 style={{ fontSize: '28px', margin: '10px 0', background: 'linear-gradient(135deg,#667eea,#ff44aa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Quantum Music</h1>
          {currentTrack && (
            <div style={{ marginTop: '20px' }}>
              <h2 style={{ margin: 0 }}>{currentTrack.title}</h2>
              <p style={{ opacity: 0.7 }}>{currentTrack.artist}</p>
              <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px', margin: '15px 0' }}>
                <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg,#667eea,#ff44aa)', borderRadius: '2px', transition: 'width 0.1s linear' }}></div>
              </div>
              <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
                <button onClick={isPlaying ? pauseTrack : () => playTrack(currentTrack)} className="clj-btn" style={{ padding: '15px 30px', fontSize: '20px', borderRadius: '50px', background: 'linear-gradient(135deg,#667eea,#764ba2)' }}>
                  {isPlaying ? '⏸️ Pause' : '▶️ Play'}
                </button>
              </div>
            </div>
          )}
        </div>

        <div style={{ marginTop: '30px' }}>
          <h3>Playlist</h3>
          {playlist.map(track => (
            <div key={track.id} onClick={() => playTrack(track)} className="clj-card" style={{ padding: '12px 15px', marginBottom: '10px', borderRadius: '12px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: track.playing ? 'rgba(102,126,234,0.3)' : 'rgba(255,255,255,0.05)' }}>
              <div>
                <strong>{track.title}</strong>
                <div style={{ fontSize: '12px', opacity: 0.7 }}>{track.artist}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span>{track.duration}</span>
                {track.playing && <span style={{ fontSize: '20px' }}>🎵</span>}
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '20px' }}>
          <label>Volume: {volume}%</label>
          <input type="range" min="0" max="100" value={volume} onInput={(e) => setVolume(e.target.value)} style={{ width: '100%', marginTop: '5px' }} />
        </div>
      </div>
    </div>
  );
}

__CLJ_mount(MusicPlayer, 'root');