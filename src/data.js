export const img = {
  cricket: '/img/cricket.jpg',
  stadium: '/img/stadium.jpg',
  football: '/img/football.jpg',
  tennis: '/img/tennis.jpg',
  basketball: '/img/basketball.jpg',
  kabaddi: '/img/kabaddi.jpg',
  casino: '/img/casino.jpg',
  roulette: '/img/roulette.jpg',
  cards: '/img/cards.jpg',
  poker: '/img/poker.jpg',
  chips: '/img/chips.jpg',
  plane: '/img/plane.jpg',
  rocket: '/img/rocket.jpg',
  gems: '/img/gems.jpg',
  neon: '/img/neon.jpg',
  dice: '/img/dice.jpg',
  gold: '/img/gold.jpg',
  night: '/img/night.jpg',
  crowd: '/img/crowd.jpg',
  live: '/img/live.jpg',
  wheel: '/img/wheel.jpg',
  coin: '/img/coin.jpg',
  color: '/img/color.jpg',
  mine: '/img/mine.jpg',
  plinko: '/img/plinko.jpg',
  dragon: '/img/dragon.jpg',
  party: '/img/party.jpg'
}

export const games = [
  { id: 'aviator', play: 'aviator', name: 'Aviator', cat: 'crash', img: img.plane, hot: true },
  { id: 'roulette', play: 'roulette', name: 'Auto Roulette', cat: 'table', img: img.roulette, hot: true },
  { id: 'slots', play: 'slots', name: 'Fortune Gems', cat: 'slots', img: img.gems, hot: true },
  { id: 'plinko', play: 'plinko', name: 'Plinko X', cat: 'instant', img: img.plinko, hot: true },
  { id: 'mines', play: 'mines', name: 'Prime Mines', cat: 'instant', img: img.mine, hot: true },
  { id: 'color', play: 'color', name: 'Color Game', cat: 'color', img: img.color, hot: true },
  { id: 'coinflip', play: 'coinflip', name: 'Coin Flip', cat: 'instant', img: img.coin },
  { id: 'dice', play: 'dice', name: 'Lucky Dice', cat: 'instant', img: img.dice },
  { id: 'teenpatti', play: 'teenpatti', name: 'Teen Patti', cat: 'cards', img: img.cards, hot: true },
  { id: 'dragontiger', play: 'dragontiger', name: 'Dragon Tiger', cat: 'cards', img: img.dragon },
  { id: 'andarbahar', play: 'andarbahar', name: 'Andar Bahar', cat: 'cards', img: img.poker },
  { id: 'crash', play: 'crash', name: 'Crash X', cat: 'crash', img: img.rocket, hot: true },
  { id: 'wingo', play: 'wingo', name: 'WinGo', cat: 'color', img: img.neon, hot: true },
  { id: 'blackjack', play: 'blackjack', name: 'Blackjack', cat: 'cards', img: img.chips },
  { id: 'baccarat', play: 'baccarat', name: 'Speed Baccarat', cat: 'live', img: img.casino, hot: true },
  { id: 'crazytime', play: 'crazytime', name: 'Crazy Wheel', cat: 'live', img: img.wheel, hot: true },
  { id: 'skyward', play: 'aviator', name: 'Skyward', cat: 'crash', img: img.night },
  { id: 'goldslots', play: 'slots', name: 'Golden Empire', cat: 'slots', img: img.gold },
  { id: 'livewheel', play: 'crazytime', name: 'Live Show', cat: 'live', img: img.live },
  { id: 'poker', play: 'teenpatti', name: 'Indian Poker', cat: 'cards', img: img.poker }
]

export const cats = ['all', 'trending', 'crash', 'live', 'slots', 'cards', 'instant', 'color', 'table']

export const providers = [
  { name: 'Evolution', img: img.roulette },
  { name: 'Spribe', img: img.plane },
  { name: 'Jili', img: img.gems },
  { name: 'MAC88', img: img.cards },
  { name: 'Ezugi', img: img.casino },
  { name: 'Playtech', img: img.chips },
  { name: 'Pragmatic', img: img.neon },
  { name: 'Red Tiger', img: img.gold },
  { name: 'PG Soft', img: img.party },
  { name: 'Hacksaw', img: img.rocket },
  { name: 'Nolimit', img: img.live },
  { name: 'Microgaming', img: img.wheel }
]

export const sports = [
  { id: 'cricket', name: 'Cricket' },
  { id: 'football', name: 'Football' },
  { id: 'tennis', name: 'Tennis' },
  { id: 'kabaddi', name: 'Kabaddi' },
  { id: 'basketball', name: 'Basketball' }
]

export const slides = [
  { title: 'Welcome Bonus', text: 'Grab up to ₹1,00,000 extra on your first deposit.', to: '/promos', img: img.gold },
  { title: 'India vs West Indies', text: 'Live cricket markets with boosted odds. Bet now.', to: '/sports', img: img.cricket },
  { title: 'Aviator Nights', text: 'Cash out before the plane flies away.', to: '/game/aviator', img: img.plane },
  { title: 'Live Casino Party', text: 'Roulette, Teen Patti, Baccarat and Crazy Wheel.', to: '/live', img: img.casino },
  { title: '9x Cricket Boost', text: 'Selected cricket markets this week only.', to: '/promos', img: img.stadium },
  { title: 'Fortune Gems', text: 'Spin the stones. Hit 3 alike for 12x.', to: '/game/slots', img: img.gems }
]

export const promos = [
  { code: 'WELCOME', title: 'Welcome Bonus', desc: 'Get 50% extra on your first deposit, up to ₹10,000.', amount: 500, tag: 'New', img: img.gold },
  { code: 'APP500', title: 'App Bonus ₹500', desc: 'Claim a free ₹500 play credit after first login.', amount: 500, tag: 'App', img: img.neon },
  { code: 'CRICKET9X', title: '9x Cricket Boost', desc: 'Boosted odds on selected cricket markets this week.', amount: 250, tag: 'Sports', img: img.cricket },
  { code: 'CASINO', title: 'Casino Disco Party', desc: 'Weekly reload of ₹300 for live casino play.', amount: 300, tag: 'Casino', img: img.party },
  { code: 'AVIATOR', title: 'Aviator Cash Drop', desc: 'Random cash drops during Aviator sessions.', amount: 200, tag: 'Crash', img: img.plane },
  { code: 'REFER', title: 'Refer & Earn', desc: 'Invite friends and earn ₹250 per successful signup.', amount: 250, tag: 'Friends', img: img.crowd }
]

export const faqs = [
  { q: 'What payment methods are accepted?', a: 'Demo wallet supports UPI, wallets and bank transfer simulation. Minimum deposit is ₹500.' },
  { q: 'How do I register?', a: 'Click Login / Sign Up, enter a 10-digit mobile number and the demo OTP 123456.' },
  { q: 'What is the welcome bonus?', a: 'New users start with ₹5,000 demo credits. First deposit also adds 50% extra up to ₹10,000.' },
  { q: 'What are withdrawal requirements?', a: 'Sports bets need 1x wagering on deposits. Casino games need 3x. Demo withdrawals require wagering to match deposits.' },
  { q: 'Is there a sports exchange?', a: 'Yes. Open Exchange to back or lay selections with live-style odds.' },
  { q: 'How do I place a sportsbook bet?', a: 'Pick a match, tap an odd, set stake on the bet slip and confirm.' },
  { q: 'Minimum deposit and withdrawal?', a: 'Deposit ₹500, withdraw ₹1000.' },
  { q: 'Are live dealer games available?', a: 'Live casino lobby includes roulette, baccarat, teen patti and crazy wheel simulations.' }
]

export const quotes = [
  { t: 'Best games and sports selection, plus solid bonuses. Keep it up Arena99.', n: 'Rahul Gupta', c: 'Noida', img: '/img/p1.jpg' },
  { t: 'The sportsbook feels like a land venue. I predicted the match and cashed the win.', n: 'Chandra Baadigar', c: 'Bangalore', img: '/img/p2.jpg' },
  { t: 'Fast cashouts. I played several games and withdrew within a few hours.', n: 'Amit Tiwari', c: 'Lucknow', img: '/img/p3.jpg' },
  { t: 'A friend referred me. Made a strong start in week one on a trusted playground.', n: 'Kartik Mani', c: 'Chennai', img: '/img/p4.jpg' },
  { t: 'VIP perks are generous and 24/7 support actually replies.', n: 'Suraj Vaidya', c: 'Mumbai', img: '/img/p5.jpg' },
  { t: 'Responsible tools plus convenient deposit and withdrawal methods.', n: 'Prakash Madekar', c: 'Pune', img: '/img/p6.jpg' }
]
