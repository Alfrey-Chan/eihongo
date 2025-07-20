class JapaneseQuiz {
    constructor() {
        this.currentQuestion = 0;
        this.userAnswers = [];
        this.score = 0;
        this.isQuizComplete = false;
        this.selectedOption = null;
        this.explanationVisible = false;
        
        this.initializeElements();
        this.setupEventListeners();
        this.loadQuestion();
    }
    
    initializeElements() {
        this.elements = {
            progressFill: document.getElementById('progress-fill'),
            progressText: document.getElementById('progress-text'),
            progressPercentage: document.getElementById('progress-percentage'),
            vocabularyTags: document.getElementById('vocabulary-tags'),
            questionType: document.getElementById('question-type'),
            difficultyBadge: document.getElementById('difficulty-badge'),
            questionNumberLarge: document.getElementById('question-number-large'),
            questionText: document.getElementById('question-text'),
            skillsTested: document.getElementById('skills-tested'),
            optionsContainer: document.getElementById('options-container'),
            explanationSection: document.getElementById('explanation-section'),
            correctAnswer: document.getElementById('correct-answer'),
            optionExplanations: document.getElementById('option-explanations'),
            additionalInfo: document.getElementById('additional-info'),
            questionSection: document.getElementById('question-section'),
            resultsSection: document.getElementById('results-section'),
            performanceStatus: document.getElementById('performance-status'),
            correctCount: document.getElementById('correct-count'),
            incorrectCount: document.getElementById('incorrect-count'),
            finalPercentage: document.getElementById('final-percentage'),
            takeAgainBtn: document.getElementById('take-again-btn'),
            reviewList: document.getElementById('review-list'),
            prevButton: document.getElementById('prev-button'),
            nextButton: document.getElementById('next-button'),
            showExplanation: document.getElementById('show-explanation')
        };
    }
    
    setupEventListeners() {
        this.elements.prevButton.addEventListener('click', () => this.previousQuestion());
        this.elements.nextButton.addEventListener('click', () => this.nextQuestion());
        this.elements.takeAgainBtn.addEventListener('click', () => this.restartQuiz());
        this.elements.showExplanation.addEventListener('click', () => this.toggleExplanation());
    }
    
    loadQuestion() {
        const question = quizData.questions[this.currentQuestion];
        
        this.updateProgress();
        this.updateQuestionInfo(question);
        this.updateQuestionText(question);
        this.updateSkillsTested(question);
        this.updateOptions(question);
        this.updateNavigationButtons();
        this.hideExplanation();
        
        this.selectedOption = this.userAnswers[this.currentQuestion] || null;
        this.updateSelectedOption();
    }
    
    updateProgress() {
        const progress = ((this.currentQuestion + 1) / quizData.total_questions) * 100;
        this.elements.progressFill.style.width = `${progress}%`;
        this.elements.progressText.textContent = `Question ${this.currentQuestion + 1} of ${quizData.total_questions}`;
        this.elements.progressPercentage.textContent = `${Math.round(progress)}%`;
    }
    
    updateQuestionInfo(question) {
        this.elements.questionType.textContent = question.question_type;
        this.elements.difficultyBadge.textContent = question.difficulty_level;
        this.elements.questionNumberLarge.textContent = question.question_number;
        
        // Update difficulty badge color
        const badge = this.elements.difficultyBadge;
        badge.className = 'difficulty-badge';
        if (question.difficulty_level === 'Elementary') {
            badge.classList.add('elementary');
        } else if (typeof question.difficulty_level === 'number') {
            if (question.difficulty_level <= 2) {
                badge.classList.add('elementary');
            } else if (question.difficulty_level <= 3) {
                badge.classList.add('intermediate');
            } else {
                badge.classList.add('advanced');
            }
        }
    }
    
    updateQuestionText(question) {
        this.elements.questionText.textContent = question.question_text;
    }
    
    updateSkillsTested(question) {
        const skillsContainer = this.elements.skillsTested;
        skillsContainer.innerHTML = '<span class="skill-icon">🎯</span>';
        
        question.skills_tested.forEach(skill => {
            const skillTag = document.createElement('span');
            skillTag.className = 'skill-tag';
            skillTag.textContent = skill;
            skillsContainer.appendChild(skillTag);
        });
    }
    
    updateOptions(question) {
        this.elements.optionsContainer.innerHTML = '';
        
        question.options.forEach(option => {
            const button = document.createElement('button');
            button.className = 'option-button';
            button.setAttribute('data-option', option.label);
            
            const label = document.createElement('span');
            label.className = 'option-label';
            label.textContent = option.label;
            
            const text = document.createElement('span');
            text.className = 'option-text';
            text.textContent = option.text;
            
            button.appendChild(label);
            button.appendChild(text);
            
            button.addEventListener('click', () => this.selectOption(option.label));
            
            this.elements.optionsContainer.appendChild(button);
        });
    }
    
    selectOption(optionLabel) {
        this.selectedOption = optionLabel;
        this.userAnswers[this.currentQuestion] = optionLabel;
        this.updateSelectedOption();
        this.updateNavigationButtons();
    }
    
    updateSelectedOption() {
        const optionButtons = this.elements.optionsContainer.querySelectorAll('.option-button');
        optionButtons.forEach(button => {
            button.classList.remove('selected', 'correct', 'incorrect');
            if (button.getAttribute('data-option') === this.selectedOption) {
                button.classList.add('selected');
            }
        });
    }
    
    updateNavigationButtons() {
        this.elements.prevButton.disabled = this.currentQuestion === 0;
        
        // Show explanation button if answer is selected
        if (this.selectedOption) {
            this.elements.showExplanation.style.display = 'flex';
        } else {
            this.elements.showExplanation.style.display = 'none';
        }
        
        // Handle next button logic
        if (this.currentQuestion === quizData.total_questions - 1) {
            this.elements.nextButton.textContent = 'Finish Quiz';
            this.elements.nextButton.onclick = () => this.finishQuiz();
        } else {
            this.elements.nextButton.textContent = 'Next';
            this.elements.nextButton.onclick = () => this.nextQuestion();
        }
    }
    
    previousQuestion() {
        if (this.currentQuestion > 0) {
            this.currentQuestion--;
            this.loadQuestion();
        }
    }
    
    nextQuestion() {
        if (this.currentQuestion < quizData.total_questions - 1) {
            this.currentQuestion++;
            this.loadQuestion();
        }
    }
    
    toggleExplanation() {
        if (this.explanationVisible) {
            this.hideExplanation();
        } else {
            this.showExplanationDetails();
        }
    }
    
    showExplanationDetails() {
        const question = quizData.questions[this.currentQuestion];
        
        this.elements.correctAnswer.textContent = question.explanation.correct_answer;
        
        this.elements.optionExplanations.innerHTML = '';
        Object.entries(question.explanation.option_explanations).forEach(([label, explanation]) => {
            const explanationDiv = document.createElement('div');
            explanationDiv.className = 'option-explanation';
            
            const correctOption = question.options.find(opt => opt.is_correct);
            if (correctOption && correctOption.label === label) {
                explanationDiv.classList.add('correct');
            }
            
            const labelDiv = document.createElement('div');
            labelDiv.className = 'option-explanation-label';
            labelDiv.textContent = `Option ${label}:`;
            
            const explanationText = document.createElement('div');
            explanationText.className = 'option-explanation-text';
            explanationText.textContent = explanation;
            
            explanationDiv.appendChild(labelDiv);
            explanationDiv.appendChild(explanationText);
            this.elements.optionExplanations.appendChild(explanationDiv);
        });
        
        this.elements.additionalInfo.textContent = question.additional_information;
        
        this.elements.explanationSection.style.display = 'block';
        this.elements.showExplanation.innerHTML = '<span class="info-icon">ℹ️</span> Hide Explanation';
        
        this.explanationVisible = true;
        this.highlightCorrectAnswer();
    }
    
    hideExplanation() {
        this.elements.explanationSection.style.display = 'none';
        this.elements.showExplanation.innerHTML = '<span class="info-icon">ℹ️</span> Show Explanation';
        
        this.explanationVisible = false;
        this.updateSelectedOption();
    }
    
    highlightCorrectAnswer() {
        const question = quizData.questions[this.currentQuestion];
        const optionButtons = this.elements.optionsContainer.querySelectorAll('.option-button');
        
        optionButtons.forEach(button => {
            const optionLabel = button.getAttribute('data-option');
            const option = question.options.find(opt => opt.label === optionLabel);
            
            button.classList.remove('selected', 'correct', 'incorrect');
            
            if (option.is_correct) {
                button.classList.add('correct');
            } else if (optionLabel === this.selectedOption) {
                button.classList.add('incorrect');
            }
        });
    }
    
    finishQuiz() {
        this.calculateScore();
        this.showResults();
        this.isQuizComplete = true;
    }
    
    calculateScore() {
        this.score = 0;
        this.userAnswers.forEach((answer, index) => {
            if (answer) {
                const question = quizData.questions[index];
                const correctOption = question.options.find(opt => opt.is_correct);
                if (answer === correctOption.label) {
                    this.score++;
                }
            }
        });
    }
    
    showResults() {
        this.elements.questionSection.style.display = 'none';
        this.elements.resultsSection.style.display = 'block';
        
        const percentage = Math.round((this.score / quizData.total_questions) * 100);
        const incorrectCount = quizData.total_questions - this.score;
        
        // Update score display
        this.elements.correctCount.textContent = this.score;
        this.elements.incorrectCount.textContent = incorrectCount;
        this.elements.finalPercentage.textContent = `${percentage}%`;
        
        // Update performance status
        const statusElement = this.elements.performanceStatus;
        const statusIcon = statusElement.querySelector('.status-icon');
        const statusText = statusElement.querySelector('.status-text');
        
        if (percentage >= 80) {
            statusElement.className = 'performance-status excellent';
            statusIcon.textContent = '🎉';
            statusText.textContent = 'Excellent!';
        } else if (percentage >= 60) {
            statusElement.className = 'performance-status good';
            statusIcon.textContent = '👍';
            statusText.textContent = 'Good Job!';
        } else {
            statusElement.className = 'performance-status';
            statusIcon.textContent = '🎯';
            statusText.textContent = 'Needs Improvement';
        }
        
        // Create question review
        this.createQuestionReview();
    }
    
    createQuestionReview() {
        this.elements.reviewList.innerHTML = '';
        
        this.userAnswers.forEach((answer, index) => {
            const question = quizData.questions[index];
            const correctOption = question.options.find(opt => opt.is_correct);
            const isCorrect = answer === correctOption.label;
            
            const reviewItem = document.createElement('div');
            reviewItem.className = 'review-item';
            
            const reviewQuestion = document.createElement('div');
            reviewQuestion.className = 'review-question';
            
            const reviewIcon = document.createElement('span');
            reviewIcon.className = `review-icon ${isCorrect ? 'correct' : 'incorrect'}`;
            reviewIcon.textContent = isCorrect ? '✅' : '❌';
            
            const reviewText = document.createElement('span');
            reviewText.className = 'review-text';
            reviewText.textContent = `Question ${index + 1}`;
            
            reviewQuestion.appendChild(reviewIcon);
            reviewQuestion.appendChild(reviewText);
            
            const reviewAnswers = document.createElement('div');
            reviewAnswers.className = 'review-answers';
            
            if (!isCorrect) {
                const userAnswerTag = document.createElement('span');
                userAnswerTag.className = 'answer-tag user-answer';
                userAnswerTag.textContent = `Your answer: ${answer || 'No answer'}`;
                reviewAnswers.appendChild(userAnswerTag);
            }
            
            const correctAnswerTag = document.createElement('span');
            correctAnswerTag.className = 'answer-tag correct-answer';
            correctAnswerTag.textContent = `Correct: ${correctOption.label}`;
            reviewAnswers.appendChild(correctAnswerTag);
            
            reviewItem.appendChild(reviewQuestion);
            reviewItem.appendChild(reviewAnswers);
            
            this.elements.reviewList.appendChild(reviewItem);
        });
    }
    
    restartQuiz() {
        this.currentQuestion = 0;
        this.userAnswers = [];
        this.score = 0;
        this.isQuizComplete = false;
        this.selectedOption = null;
        this.explanationVisible = false;
        
        this.elements.resultsSection.style.display = 'none';
        this.elements.questionSection.style.display = 'block';
        
        this.loadQuestion();
    }
}

// Theme management
class ThemeManager {
    constructor() {
        this.currentTheme = localStorage.getItem('theme') || 'dark';
        this.applyTheme(this.currentTheme);
        this.setupThemeToggle();
    }
    
    applyTheme(theme) {
        const body = document.body;
        const themeIcon = document.querySelector('.theme-icon');
        
        if (theme === 'light') {
            body.setAttribute('data-theme', 'light');
            if (themeIcon) themeIcon.textContent = '☀️';
        } else {
            body.removeAttribute('data-theme');
            if (themeIcon) themeIcon.textContent = '🌙';
        }
        
        this.currentTheme = theme;
        localStorage.setItem('theme', theme);
    }
    
    toggleTheme() {
        const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.applyTheme(newTheme);
    }
    
    setupThemeToggle() {
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }
    }
}

// Initialize the quiz when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new JapaneseQuiz();
    new ThemeManager();
});