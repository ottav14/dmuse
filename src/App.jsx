import { useEffect, useState } from 'react'
import styles from './App.module.css';

function App() {

	const [ keys, setKeys] = useState(Array(7).fill(false));


	useEffect(() => {
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
			',': 6
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

	const WhiteKey = (ix) => {
		return (
			<div className={keys[ix] ? styles.active : styles.whiteKey} />
		);
	}

	return (
		<div className={styles.main}>
			{keys.map((val, i) => (
				<div
					className={keys[i] ? styles.active : styles.whiteKey}
					key={i}
				/>
			))}
		</div>
	);
}
export default App;
