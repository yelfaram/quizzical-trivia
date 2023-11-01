import { useState, useEffect } from 'react'
import { nanoid } from "nanoid";
import Question from './Question'
import Loading from './Loading';
import Confetti from "react-confetti";

function Game() {
    // state to hold the trivia questions
    const [triviaQuestions, setTriviaQuestions] = useState([])
    // state that takes care of managing whether submit btn should be active or not
    const [allOptionsSelected, setAllOptionsSelected] = useState(false)
    // state that takes care of managing whether btn should change to "Play Again"
    // also used as disabled for option div
    const [allOptionsChecked, setAllOptionsChecked] = useState(false)
    // state that tracks the score of the game
    const [gameScore, setGameScore] = useState(0)
    // state that allows for population of triviaQuestions on initial render and when game ends
    const [gameEnd, setGameEnd] = useState(false)

    // state for loading when fetching from API
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setTimeout(() => {
            setLoading(false); // After a certain duration, set isLoading to false
        }, 1000);
    }, [gameEnd]);

    function newGame() {
        setGameEnd(prevBool => !prevBool)
        setGameScore(0)
        setAllOptionsChecked(false)
        setLoading(true)
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

    // handles checking if each question has atleast 1 option selected to toggle
    // submit btn (active or disabled)
    useEffect(() => {
        const allQuestionsHaveOptionHeld = triviaQuestions.every(question => question.options.some(option => option.isHeld))
        allQuestionsHaveOptionHeld ? setAllOptionsSelected(true) : setAllOptionsSelected(false)
    }, [triviaQuestions])
    

    // useEffect that takes care of setting the once when allOptionsChecked changes
    useEffect(() => {
        if (allOptionsChecked) {
        // make an array that contains options with isHeld and isCorrect set to true
        const validHeldOptions = triviaQuestions.flatMap(question => question.options.filter(option => option.isHeld && option.isCorrect))
        setGameScore(validHeldOptions.length)
        }
    }, [allOptionsChecked])

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

    if (loading) {
        return <Loading />
    }

    return (
        <main>
            {gameScore === 4 && <Confetti />}

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
        </main>
    )
}

export default Game