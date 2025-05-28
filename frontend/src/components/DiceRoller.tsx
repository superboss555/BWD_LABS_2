import React, { useState, useEffect } from 'react';
import styles from '../pages/Events/Events.module.scss';

interface DiceRollerProps {
  min?: number;
  max?: number;
  value: number;
  onRoll: (value: number) => void;
  disabled?: boolean;
}

const getRandomInt = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const DiceRoller: React.FC<DiceRollerProps> = ({ min = 1, max = 10, value, onRoll, disabled }) => {
  const [rolling, setRolling] = useState(false);
  const [displayValue, setDisplayValue] = useState(value);
  const [canRoll, setCanRoll] = useState(true);

  useEffect(() => {
    console.log('=== DiceRoller Value Sync ===');
    console.log('Parent value:', value);
    console.log('Current display value:', displayValue);
    if (!rolling) {
      setDisplayValue(value);
    }
  }, [value, rolling]);

  const rollDice = () => {
    if (rolling || !canRoll) return;
    
    setRolling(true);
    setCanRoll(false);
    
    const animationDuration = 1000;
    let animationFrame = 0;
    let finalValue = displayValue;
    
    // Генерируем финальное значение заранее
    finalValue = getRandomInt(min, max);
    console.log('=== DiceRoller Roll Start ===');
    console.log('Target final value:', finalValue);

    // Анимация будет стремиться к финальному значению
    const interval = setInterval(() => {
      // В последнем кадре показываем финальное значение
      if (animationFrame >= 10) {
        setDisplayValue(finalValue);
        clearInterval(interval);
      } else {
        // В остальных кадрах показываем случайные значения
        setDisplayValue(getRandomInt(min, max));
      }
      animationFrame++;
    }, animationDuration / 10);

    setTimeout(() => {
      console.log('=== DiceRoller Roll End ===');
      console.log('Final value:', finalValue);
      
      setDisplayValue(finalValue);
      setRolling(false);
      onRoll(finalValue);
      
      setTimeout(() => setCanRoll(true), 1500);
    }, animationDuration);
  };

  return (
    <div className={styles.diceRollerWrapper}>
      <div className={styles.diceArea}>
        <div className={`${styles.dice} ${rolling ? styles.rolling : ''}`}>
          {displayValue}
        </div>
      </div>
      <button
        className={styles.rerollButton}
        onClick={rollDice}
        disabled={rolling || !canRoll || disabled}
      >
        Перебросить
      </button>
      <div className={styles.diceLabel}>
        Мероприятий на странице: <b>{displayValue}</b>
      </div>
    </div>
  );
};

export default DiceRoller; 