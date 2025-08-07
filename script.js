// Quote Database
const quotes = [
    {
        text: "The only way to do great work is to love what you do.",
        author: "Steve Jobs"
    },
    {
        text: "Innovation distinguishes between a leader and a follower.",
        author: "Steve Jobs"
    },
    {
        text: "Life is what happens while you're busy making other plans.",
        author: "John Lennon"
    },
    {
        text: "The future belongs to those who believe in the beauty of their dreams.",
        author: "Eleanor Roosevelt"
    },
    {
        text: "It is during our darkest moments that we must focus to see the light.",
        author: "Aristotle"
    },
    {
        text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
        author: "Winston Churchill"
    },
    {
        text: "The only impossible journey is the one you never begin.",
        author: "Tony Robbins"
    },
    {
        text: "In the middle of difficulty lies opportunity.",
        author: "Albert Einstein"
    },
    {
        text: "Believe you can and you're halfway there.",
        author: "Theodore Roosevelt"
    },
    {
        text: "The only person you are destined to become is the person you decide to be.",
        author: "Ralph Waldo Emerson"
    },
    {
        text: "Don't watch the clock; do what it does. Keep going.",
        author: "Sam Levenson"
    },
    {
        text: "Everything you've ever wanted is on the other side of fear.",
        author: "George Addair"
    },
    {
        text: "Hardships often prepare ordinary people for an extraordinary destiny.",
        author: "C.S. Lewis"
    },
    {
        text: "The way to get started is to quit talking and begin doing.",
        author: "Walt Disney"
    },
    {
        text: "Don't be afraid to give up the good to go for the great.",
        author: "John D. Rockefeller"
    }
];

// Beautiful gradient combinations for quote cards
const gradients = [
    'gradient-1', 'gradient-2', 'gradient-3', 'gradient-4', 'gradient-5',
    'gradient-6', 'gradient-7', 'gradient-8', 'gradient-9', 'gradient-10'
];

class WisdomVault {
    constructor() {
        this.currentQuote = null;
        this.currentGradientIndex = 0;
        this.favorites = JSON.parse(localStorage.getItem('wisdomVault') || '[]');
        this.elements = {
            quote: document.getElementById('quote'),
            author: document.getElementById('author'),
            quoteCard: document.getElementById('quoteCard'),
            newBtn: document.getElementById('newBtn'),
            saveBtn: document.getElementById('saveBtn'),
            heart: document.getElementById('heart'),
            saveText: document.getElementById('saveText'),
            favBtn: document.getElementById('favBtn'),
            count: document.getElementById('count'),
            sidebar: document.getElementById('sidebar'),
            closeBtn: document.getElementById('closeBtn'),
            overlay: document.getElementById('overlay'),
            collection: document.getElementById('collection')
        };
        this.init();
    }

    init() {
        this.showRandomQuote();
        this.updateUI();
        this.bindEvents();
    }

    bindEvents() {
        // Main controls
        this.elements.newBtn.addEventListener('click', () => this.showRandomQuote());
        this.elements.saveBtn.addEventListener('click', () => this.toggleFavorite());
        this.elements.favBtn.addEventListener('click', () => this.openSidebar());
        this.elements.closeBtn.addEventListener('click', () => this.closeSidebar());
        this.elements.overlay.addEventListener('click', () => this.closeSidebar());
        
        // Event delegation for remove buttons
        this.elements.collection.addEventListener('click', (e) => {
            const removeBtn = e.target.closest('.remove-btn');
            if (removeBtn) {
                const index = parseInt(removeBtn.dataset.index);
                this.removeFavoriteByIndex(index);
            }
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.target.matches('input, textarea')) return;
            const key = e.key.toLowerCase();
            if (key === 'n') this.showRandomQuote();
            if (key === 's') { e.preventDefault(); this.toggleFavorite(); }
            if (key === 'f') this.openSidebar();
            if (key === 'escape') this.closeSidebar();
        });
    }

    showRandomQuote() {
        let quote;
        do {
            quote = quotes[Math.floor(Math.random() * quotes.length)];
        } while (quote === this.currentQuote && quotes.length > 1);
        
        this.currentQuote = quote;
        
        // Change gradient for each new quote
        this.currentGradientIndex = (this.currentGradientIndex + 1) % gradients.length;
        
        // Remove all gradient classes and add new one
        this.elements.quoteCard.className = 'quote-card'; // Reset classes
        this.elements.quoteCard.classList.add(gradients[this.currentGradientIndex]);
        
        // Update text with smooth transition
        this.elements.quote.style.opacity = '0';
        this.elements.author.style.opacity = '0';
        
        setTimeout(() => {
            this.elements.quote.textContent = quote.text;
            this.elements.author.textContent = `— ${quote.author}`;
            
            this.elements.quote.style.opacity = '1';
            this.elements.author.style.opacity = '1';
            
            this.updateSaveButton();
        }, 200); // Short delay for fade effect
    }

    toggleFavorite() {
        if (!this.currentQuote) return;
        
        const id = this.createQuoteId(this.currentQuote);
        const index = this.favorites.findIndex(f => this.createQuoteId(f) === id);
        
        if (index > -1) {
            this.favorites.splice(index, 1);
            this.notify('Removed from collection 🗑️', 'error');
        } else {
            this.favorites.unshift({ 
                ...this.currentQuote, 
                saved: Date.now(),
                id: id
            });
            this.notify('Added to collection ✨');
        }
        
        this.save();
        this.updateUI();
    }

    createQuoteId(quote) {
        return `${quote.text}|${quote.author}`;
    }

    updateSaveButton() {
        if (!this.currentQuote) return;
        
        const id = this.createQuoteId(this.currentQuote);
        const saved = this.favorites.some(f => this.createQuoteId(f) === id);
        
        this.elements.saveBtn.classList.toggle('saved', saved);
        this.elements.heart.className = saved ? 'fas fa-heart' : 'far fa-heart';
        this.elements.saveText.textContent = saved ? 'Saved' : 'Save';
    }

    updateUI() {
        this.elements.count.textContent = this.favorites.length;
        this.updateSaveButton();
        this.renderCollection();
    }

    renderCollection() {
        if (!this.favorites.length) {
            this.elements.collection.innerHTML = `
                <div class="empty">
                    <i class="fas fa-bookmark"></i>
                    <h3>No quotes saved yet</h3>
                    <p>Start building your wisdom collection</p>
                </div>
            `;
            return;
        }
        
        this.elements.collection.innerHTML = this.favorites.map((quote, index) => `
            <div class="item" style="animation-delay: ${index * 0.1}s">
                <div class="item-quote">"${this.escapeHtml(quote.text)}"</div>
                <div class="item-author">— ${this.escapeHtml(quote.author)}</div>
                <button class="remove-btn" data-index="${index}">
                    <i class="fas fa-trash"></i>
                    Remove
                </button>
            </div>
        `).join('');
    }

    removeFavoriteByIndex(index) {
        if (index >= 0 && index < this.favorites.length) {
            const removedQuote = this.favorites[index];
            this.favorites.splice(index, 1);
            this.save();
            this.updateUI();
            this.notify(`Quote removed 🗑️`, 'error');
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    openSidebar() {
        this.elements.sidebar.classList.add('active');
        this.elements.overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeSidebar() {
        this.elements.sidebar.classList.remove('active');
        this.elements.overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    save() {
        localStorage.setItem('wisdomVault', JSON.stringify(this.favorites));
    }

    notify(message, type = 'success') {
        const existing = document.querySelector('.notification');
        if (existing) existing.remove();
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas ${type === 'error' ? 'fa-times-circle' : 'fa-check-circle'}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 3000);
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => new WisdomVault());
