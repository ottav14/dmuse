import { useEffect, useState, useRef } from 'react'
import styles from './App.module.css';
import fs from 'fs';
import readline from 'readline';

const parseMap = (filename) => {
	const parsedData = [];
	fetch(filename)
		.then((res) => res.text())
		.then((data) => {
			// Find measure 1
			const m1_location = data.indexOf('measure 1');
			const mapData = data.slice(m1_location, data.length);
			const lines = mapData.split(/\r?\n/);
			for(let i=0; i<lines.length; i++)
				if(lines[i].length !== 4)
					lines.pop(i);
			console.log(lines);

			for(const line of lines) {
				const note = [];
				for(let i=0; i<line.length; i++)
					if(line[i] === '1')
						note.push(i);
				parsedData.push(note);
			}
		})
	return parsedData;
}

function App() {

	const [ keys, setKeys ] = useState(Array(4).fill(false));
	const [ notes, setNotes ] = useState([]);
	const [ loading, setLoading ] = useState(true);
	const [ playing, setPlaying ] = useState(false);
	const [ map, setMap ] = useState([]);
	const [ mapIndex, setMapIndex ] = useState(0);
	const [ streak, setStreak ] = useState(0);
	const [ maxStreak, setMaxStreak ] = useState(0);
	const [ misses, setMisses ] = useState(0);
	const notesRef = useRef(notes);
	const mapIndexRef = useRef(mapIndex);
	const maxStreakRef = useRef(maxStreak);

	const speed = 20;
	const playMap = true;
	const frameRate = 60;
	const bpm = 250;
	const mapLocation = '/maps/speedcore/bloodstorm/bloodstorm.sm';
	const noteDiameter = 5;

	const spawnNote = (x, ix) => {
		setNotes(prev => {
			const newNote = {
				x: noteDiameter*x,
				y: 0,
				id: `${Date.now()}-${ix}`,
				lane: x
			}
			return [...prev, newNote];
		});
	}

	const moveNote = (id, newY) => {
		setNotes(prev => {
			const newNotes = [...prev];
			for(const note of newNotes)
				if(note.id === id)
					note.y = newY;
			return newNotes;
		});
	}

	const deleteNote = (id) => {
		setNotes(prev => {
			const newNotes = [...prev];
			for(let i=0; i<newNotes.length; i++) {
				if(newNotes[i].id === id) {
					newNotes.splice(i, 1);
					return newNotes;
				}
			}
			return newNotes;
		});
	}

	useEffect(() => {

		if(loading) {
			const awaitParsedMap = async () => {
				let parsedMap;
				try {
					parsedMap = await parseMap(mapLocation);
				} catch(error) {
					console.log(error);
				} finally {
					setMap(prev => parsedMap);
					setLoading(false);
					setPlaying(true);
				}
			}
			awaitParsedMap();
		}

		const updateKey = (ix, val) => {
			setKeys(prev => {
				if(!prev)
					return prev;
				const newKeys = [...prev];
				newKeys[ix] = val;
				return newKeys;
			});
		}
		
		const checkHit = (ix) => {
			const currentNotes = notesRef.current;
			for(const note of currentNotes) {

				if(note.lane === ix && note.y >= 750 && note.y <= 900) {
					deleteNote(note.id);
					setStreak(prev => {
						if(prev+1 > maxStreakRef.current)
							setMaxStreak(prev+1);
						return prev+1;
					});
				}
			}
		}

		const controls = {
			'x': 0,
			'c': 1,
			',': 2,
			'.': 3
		}

		const handleKeyDown = (e) => {
			updateKey(controls[e.key], true);
			checkHit(controls[e.key]);
		}

		const handleKeyUp = (e) => {
			updateKey(controls[e.key], false);
		}

		document.body.addEventListener("keydown", handleKeyDown);
		document.body.addEventListener("keyup", handleKeyUp);

		return () => {
			document.body.removeEventListener("keydown", handleKeyDown);
			document.body.removeEventListener("keyup", handleKeyUp);
		};
	}, []);

	useEffect(() => {

		if(playing && playMap) {
			const mapInterval = setInterval(() => {
				const currentIndex = mapIndexRef.current;
				if(currentIndex >= map.length) {
					return () => {
						clearInterval(globalInterval);
						clearInterval(mapInterval);
						setPlaying(prev => false);
					}
				}
				for(let i=0; i<map[currentIndex].length; i++)
					spawnNote(map[currentIndex][i], i);

				setMapIndex(currentIndex+1);
			}, 60000/bpm);


			const globalInterval = setInterval(() => {
				const currentNotes = notesRef.current;
				for(const note of currentNotes) {
					const newY = note.y + speed;
					if(newY > window.innerHeight + 50) {
						deleteNote(note.id);
						setMisses(prev => prev+1);
						setStreak(prev => 0);
						continue;
					}
					moveNote(note.id, newY);
					const element = document.getElementById(note.id);
					if(element) {
						element.style.transform = `translate(${note.x}rem, ${newY}px)`;
					}
				}
			}, 1000/frameRate);
		}
	}, [playing]);

	useEffect(() => {
		notesRef.current = notes;
	}, [notes]);

	useEffect(() => {
		mapIndexRef.current = mapIndex;
	}, [mapIndex]);

	useEffect(() => {
		maxStreakRef.current = maxStreak;
	}, [maxStreak]);

	if(loading) {
		return (
			<div className={styles.main}>
				Loading...
			</div>
		);
	}

	return (
		<div className={styles.main}>
			<div className={styles.stats}>
				MaxStreak: {maxStreak} <br />
				Streak: {streak} <br />
				Misses: {misses} 
			</div>
			<div className={styles.notes}>
				<div className={styles.hitZone}>
					<div className={styles.keys}>
						<div 
							className={keys[0] ? styles.active : styles.inActive} 
							style={{
								backgroundImage: `url('/arrow-left-${keys[0] ? 'blue' : 'yellow'}.svg')`,
							}}
						/>
						<div 
							className={keys[1] ? styles.active : styles.inActive} 
							style={{
								backgroundImage: `url('/arrow-down-${keys[1] ? 'blue' : 'yellow'}.svg')`,
							}}
						/>
						<div 
							className={keys[2] ? styles.active : styles.inActive} 
							style={{
								backgroundImage: `url('/arrow-up-${keys[2] ? 'blue' : 'yellow'}.svg')`,
							}}
						/>
						<div 
							className={keys[3] ? styles.active : styles.inActive} 
							style={{
								backgroundImage: `url('/arrow-right-${keys[3] ? 'blue' : 'yellow'}.svg')`,
							}}
						/>
					</div>
				</div>
				{notes.map((note) => {
					const directionKey = [ 'left', 'down', 'up', 'right' ];

					return (
						<div 
							className={styles.note} 
							key={note.id} 
							id={note.id} 
							style={{
								backgroundImage: `url('/arrow-${directionKey[note.lane]}-red.svg')`
							}}
						/>
					);
				})}
			</div>
		</div>
	);
}
export default App;
