import { useEffect, useState } from 'react'
import styles from './App.module.css';

function App() {

	const [ keys, setKeys ] = useState(Array(8).fill(false));
	const [ notes, setNotes ] = useState([]);
	const [ loading, setLoading ] = useState(true);
	const [ playing, setPlaying ] = useState(false);

	const speed = 10;

	useEffect(() => {

		const spawnNote = (x) => {
			setNotes(prev => {
				const newNote = {
					x: x,
					y: 0,
					id: Date.now()
				}
				return [...notes, newNote];
			});
		}

		if(loading) {
			setTimeout(() => {
				spawnNote(0);
				setLoading(false);
				setPlaying(true);
			}, 2000);
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
			'z': 0,
			'x': 1,
			'c': 2,
			'v': 3,
			'n': 4,
			'm': 5,
			',': 6,
			'.': 7
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

		if(playing) {
			const interval = setInterval(() => {
				for(const note of notes) {
					const newY = note.y + speed;
					if(newY > window.innerHeight + 50) {
						deleteNote(note.id);
						continue;
					}
					moveNote(note.id, newY);
					const element = document.getElementById(note.id);
					if(element) {
						element.style.transform = `translateY(${newY}px)`;
					}
				}
			}, 16);
			return () => clearInterval(interval);
		}
	}, [playing]);

	const Key = (ix) => {
		return (
			<div className={keys[ix] ? styles.active : styles.inActive} />
		);
	}

	useEffect(() => {
	}, [notes]);

	return (
		<div className={styles.main}>
			<div className={styles.notes}>
				{notes.map((note) => (
					<div className={styles.note} key={note.id} id={note.id} />
				))}
			</div>
			<div id='fart' className={styles.keys}>
				<div className={styles.left}>
					<div className={keys[0] ? styles.active : styles.inActive} />
					<div className={keys[1] ? styles.active : styles.inActive} />
					<div className={keys[2] ? styles.active : styles.inActive} />
					<div className={keys[3] ? styles.active : styles.inActive} />
				</div>
				<div className={styles.right}>
					<div className={keys[4] ? styles.active : styles.inActive} />
					<div className={keys[5] ? styles.active : styles.inActive} />
					<div className={keys[6] ? styles.active : styles.inActive} />
					<div className={keys[7] ? styles.active : styles.inActive} />
				</div>
			</div>
		</div>
	);
}
export default App;
