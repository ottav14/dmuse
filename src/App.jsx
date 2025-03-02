import { useEffect, useState } from 'react'
import styles from './App.module.css';

function App() {

	const [ keys, setKeys] = useState(Array(8).fill(false));


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

	const Key = (ix) => {
		return (
			<div className={keys[ix] ? styles.active : styles.inActive} />
		);
	}

	useEffect(() => {
	}, [keys]);

	return (
		<div className={styles.main}>
			<div className={styles.keys}>
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
