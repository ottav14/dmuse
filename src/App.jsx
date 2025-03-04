import { useEffect, useState, useRef } from 'react'
import styles from './App.module.css';
import fs from 'fs';
import readline from 'readline';

const parseMap = (filename) => {
	const parsedData = [];
	fetch(filename)
		.then((res) => res.text())
		.then((data) => {
			const lines = data.split(/\r?\n/);
			lines.pop();
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
	const notesRef = useRef(notes);
	const mapIndexRef = useRef(mapIndex);

	const speed = 10;
	const playMap = true;

	const spawnNote = (x) => {
		setNotes(prev => {
			const newNote = {
				x: 14/3*x,
				y: 0,
				id: Date.now()
			}
			return [...notes, newNote];
		});
	}

	useEffect(() => {

		if(loading) {
			const awaitParsedMap = async () => {
				let parsedMap;
				try {
					parsedMap = await parseMap('/maps/test.dm');
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

		const controls = {
			'x': 0,
			'c': 1,
			',': 2,
			'.': 3
		}

		const handleKeyDown = (e) => {
			updateKey(controls[e.key], true);
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
				for(const note of map[currentIndex])
					spawnNote(note);

				setMapIndex(currentIndex+1);
			}, 1500);


			const globalInterval = setInterval(() => {
				const currentNotes = notesRef.current;
				for(const note of currentNotes) {
					const newY = note.y + speed;
					if(newY > window.innerHeight + 50) {
						deleteNote(note.id);
						continue;
					}
					moveNote(note.id, newY);
					const element = document.getElementById(note.id);
					if(element) {
						element.style.transform = `translate(${note.x}rem, ${newY}px)`;
					}
				}
			}, 16);
		}
	}, [playing]);

	useEffect(() => {
		notesRef.current = notes;
	}, [notes]);

	useEffect(() => {
		mapIndexRef.current = mapIndex;
	}, [mapIndex]);

	return (
		<div className={styles.main}>
			<div className={styles.notes}>
				{notes.map((note) => (
					<div className={styles.note} key={note.id} id={note.id} />
				))}
				<div id='fart' className={styles.keys}>
					<div className={keys[0] ? styles.active : styles.inActive} />
					<div className={keys[1] ? styles.active : styles.inActive} />
					<div className={keys[2] ? styles.active : styles.inActive} />
					<div className={keys[3] ? styles.active : styles.inActive} />
				</div>
			</div>
		</div>
	);
}
export default App;
