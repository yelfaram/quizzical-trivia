import { useState, useEffect } from 'react'
import Intro from './components/Intro'
import Question from './components/Question'
import { nanoid } from "nanoid";
import Confetti from "react-confetti";

function App() {
  const [triviaQuestions, setTriviaQuestions] = useState([])

  // state for managing whether game has started or not
  const [gameStart, setGameStart] = useState(false)

  // state for loading when fetching from API
  // const [loading, setLoading] = useState(false);

  // state that takes care of managing whether submit btn should be active or not
  const [allOptionsSelected, setAllOptionsSelected] = useState(false)

  // state that takes care of managing whether btn should change to "Play Again"
  // also used as disabled for option div
  const [allOptionsChecked, setAllOptionsChecked] = useState(false)

  // state that tracks the score of the game
  const [gameScore, setGameScore] = useState(0)

  // state that allows for population of triviaQuestions on initial render and when game ends
  const [gameEnd, setGameEnd] = useState(false)

  // changes blob CSS style based on gameStart state
  const blobBottomStyles = {
    width: gameStart ? "150px" : "225px",
    height: gameStart ? "120px": "180px"
  }

  const blobTopStyles = {
    width: gameStart ? "160px" : "240px",
    height: gameStart ? "140px": "210px"
  }

  /**
   * Put each element in the array in an object, and give it a random sort key
   * Sort using the random key
   * Unmap to get the original elements by destructuring
   */
  function shuffleQuestionOptions(options){
    return options
      .map(item => ({ item, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ item }) => item)
  }

  // function to help create object for each option to make it controlled
  // helps with propagating function from App -> Question -> Option
  function setUpOptions(shuffledOptions) {
    const options = [];
    shuffledOptions.map(option => {
      const newOption = {
        id: nanoid(),
        option: option,
        isHeld: false,
        isCorrect: false,
        isWrong: false,
      }
      options.push(newOption);
    })
    return options;
  } 

  // based on api result need to cleanup data to be { question: "", options: []}
  function allNewQuestions(data) {
    const questions = [];
    data.results.map(item => {
      const options = setUpOptions(shuffleQuestionOptions([item.correct_answer, ...item.incorrect_answers]), item.correct_answer)
      const newQuestion = {
        id: nanoid(),
        question: item.question,
        options: options,
        correctAnswer: item.correct_answer,
        checked: false,
      }
      questions.push(newQuestion)
    })
    return questions
  }

  // useEffect to populate triviaQuestions from API whenever gameEnd toggles
  useEffect(() => {
    fetch("https://opentdb.com/api.php?amount=4")
      .then(res => res.json())
      .then(data => {
        setTriviaQuestions(allNewQuestions(data))
      })
  }, [gameEnd])

  /**
   * make use of question id and option id to toggle the correct isHeld 
   * attribute of each option
   */
  function holdOption(questionId, optionId) {
    setTriviaQuestions(oldQuestions => oldQuestions.map(question => {
      // find correct question
      if (question.id === questionId) {
        const updatedOptions = question.options.map(option => {
          // find correct option and toggle its isHeld attribute
          // if another option is clicked then itsHeld attribute should be reset
          if (option.id === optionId || option.isHeld) {
            return {
              ...option,
              isHeld: !option.isHeld
            }
          } else {
            return option
          }
        })
        // return old question but just update options
        return {
          ...question,
          options: updatedOptions
        }
      } else {
        return question
      }
    }))
  }

  // toggle gameStart state when btn in Intro page is clicked
  function handleGameStart() {
    setGameStart(prevBool => !prevBool)
  }

  // handles checking if each question has atleast 1 option selected to toggle
  // submit btn (active or disabled)
  useEffect(() => {
    const allQuestionsHaveOptionHeld = triviaQuestions.every(question => question.options.some(option => option.isHeld))
    allQuestionsHaveOptionHeld ? setAllOptionsSelected(true) : setAllOptionsSelected(false)
  }, [triviaQuestions])
  
  // function that takes care of toggling isWrong/isCorrect option attributes
  // doing so changes background color of option
  // marks each question as checked
  function checkAnswers() {
    setTriviaQuestions(oldQuestions => 
      oldQuestions.map(question => {
        const updatedOptions = question.options.map(option => {
          const optionVal = option.option
          const isHeld = option.isHeld
          const isCorrect = optionVal === question.correctAnswer

          return {
            ...option,
            isCorrect: isCorrect,
            isWrong: isHeld && !isCorrect,
          }
        })

        return {
          ...question,
          options: updatedOptions,
          checked: true // Mark question as checked
        }
      })
    )
    
    // indicates that we checked all options
    // since true we should now display "Play Again" and score
    setAllOptionsChecked(true)
  }

  // useEffect that takes care of setting the once when allOptionsChecked changes
  useEffect(() => {
    if (allOptionsChecked) {
      // make an array that contains options with isHeld and isCorrect set to true
      const validHeldOptions = triviaQuestions.flatMap(question => question.options.filter(option => option.isHeld && option.isCorrect))
      setGameScore(validHeldOptions.length)
    }
  }, [allOptionsChecked])

  function newGame() {
    setGameEnd(prevBool => !prevBool)
    setGameScore(0)
    setAllOptionsChecked(false)
  }

  // change style of submit btn if disabled by giving new className
  const btnClassName = allOptionsSelected ? "answers--submit-btn--active" : "answers--submit-btn--disabled"

  // change style of score num if no correct answers
  let scoreStyle
  if (gameScore > 0) {
    scoreStyle = {
      color: "#6aad8c",
      textShadow: "0 0 5px #6aad8c, 0 0 10px #6aad8c"
    }
  } else {
    scoreStyle = {
      color: "red",
      textShadow: "0 0 5px red, 0 0 10px red"
    }
  }

  const questionElements = triviaQuestions.map(item => {
    return (
      <Question
        key={item.id}
        id={item.id}
        question={item.question}
        options={item.options}
        holdOption={holdOption}
        allOptionsChecked={allOptionsChecked}
      />
    )
  })


  // if (loading) {
  //   return <div>Loading...</div>
  // }

  return (
    <div className="container">
      <svg 
        className="blobBottomLeft"
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 148 118" 
        fill="none"

        style={blobBottomStyles}
      >
        <path 
          fillRule="evenodd" 
          clipRule="evenodd" 
          d="M-5.55191 4.90596C35.9614 1.77498 82.2425 -9.72149 112.306 19.1094C145.581 51.0203 155.282 102.703 142.701 147.081C130.767 189.18 93.7448 220.092 51.8208 232.476C16.5281 242.902 -15.4332 218.605 -49.1007 203.738C-85.3375 187.737 -133.641 182.993 -145.741 145.239C-158.358 105.868 -132.269 64.5881 -103.064 35.3528C-77.7328 9.99541 -41.2727 7.60006 -5.55191 4.90596Z" 
          fill="#DEEBF8"
        />
      </svg>

      {gameScore === 4 && <Confetti />}
      
      { 
        gameStart &&
        <div className="questions--container">
          {questionElements}
          <div className="btn--container">
            {allOptionsChecked ?
              <div className="score--container">
                <p className="score--text">You scored <span style={scoreStyle}>{gameScore}</span>/{triviaQuestions.length} correct answers</p>
                <button 
                  className="newGame-btn"
                  onClick={newGame}
                >
                  Play again
                </button>
              </div>
            : 
            <button 
              className={btnClassName}
              disabled={!allOptionsSelected}
              onClick={checkAnswers}
            >
              {allOptionsSelected ? "Check answers" : `Please select all ${triviaQuestions.length} answers`}
            </button>}
          </div>
        </div>
      }

      {
        !gameStart && 
        <Intro 
          handleGameStart={handleGameStart}
        />
      }

      <svg 
        className="blobTopRight"
        xmlns="http://www.w3.org/2000/svg"  
        viewBox="0 0 158 141" 
        fill="none"

        style={blobTopStyles}
      >
        <path 
          fillRule="evenodd" 
          clipRule="evenodd" 
          d="M63.4095 81.3947C35.1213 50.8508 -2.68211 21.7816 1.17274 -19.6933C5.43941 -65.599 39.854 -105.359 82.4191 -123.133C122.797 -139.994 170.035 -130.256 205.822 -105.149C235.947 -84.0141 236.823 -43.8756 246.141 -8.27104C256.17 30.0508 282.521 70.8106 260.501 103.779C237.538 138.159 188.991 143.432 147.931 138.768C112.318 134.723 87.7505 107.677 63.4095 81.3947Z" 
          fill="#FFFAD1"
        />
      </svg>
    </div>
  )
}

export default App
