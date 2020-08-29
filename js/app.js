const STORAGE_ID = 'shopping-list'

// HTML5のLocalStorageを扱うためのオブジェクト
// https://developer.mozilla.org/ja/docs/Web/API/Window/localStorage
const listStorage = {

	// データの取り出しメソッド
	fetch: () => {

		const items = JSON.parse(localStorage.getItem(STORAGE_ID) || '[]');
		items.forEach((item, index) => {
			item.id = index;
		});

		listStorage.uid = items.length;

		return items;
	},

	// データの保存メソッド
	save: items => {
		localStorage.setItem(STORAGE_ID, JSON.stringify(items));
	}
}

// 表示のフィルタリング･オブジェクト
const filters = {
	all: items => items, // すべて
	active: items => items.filter(item => !item.completed),  // 未完了
	completed: items => items.filter(item => item.completed) // 完了済
}

// アプリケーション本体
const app = new Vue({

	el: '#shopping-list-app', // 「class=shopping-list-app」が付けられたDOMエレメントとの関連付け

	// アプリケーション全体で扱うリアクティブ･データ
	// https://jp.vuejs.org/v2/api/#data
	data: { 
		items: listStorage.fetch(), // LocalStorageから取り出した買い物リストデータ
		newItem: '', // 新しい買い物アイテム
		visibility: 'all' // 表示属性
	},

	// 値の変更監視
	// https://jp.vuejs.org/v2/api/#vm-watch
	watch: {
		items: {

			handler: items => {
				listStorage.save(items);
			},

			deep: true
		}
	},

	// 算出プロパティ
	// https://jp.vuejs.org/v2/api/#computed
	computed: {

		// フィルタリングされたアイテム
		filteredItems: function() {
			return filters[this.visibility](this.items);
		},

		// 未完了のアイテム
		remaining: function() {
			return filters.active(this.items).length;
		},

		// すべて完了済み
		allDone: {
			get: function() {
				return this.remaining === 0;
			},

			set: function(value) {
				this.items.forEach(function(item) {
					item.completed = value;
				});
			}
		}
	},

	// 一般メソッド
	// https://jp.vuejs.org/v2/api/#methods
	methods: {

		// 新しいアイテムを追加するメソッド
		add: function() {

			const value = this.newItem && this.newItem.trim();
			
			if (!value) {
				return;
			}

			this.items.push({
				id: listStorage.uid++,
				title: value,
				completed: false
			});

			this.newItem = '';
		},

		// 個々のアイテムを削除するメソッド
		remove: function(item) {
			this.items.splice(this.items.indexOf(item), 1);
		},

		// 完了済みアイテムをすべて削除するメソッド
		removeCompleted: function() {
			this.items = filters.active(this.items);
		}
	}
});

// ハッシュ（URLの後ろの#～）の変更に対するイベント･ハンドラの設定
window.addEventListener('hashchange', () => {

	const visibility = window.location.hash.replace(/#\/?/, '');

	if (filters[visibility]) {
		app.visibility = visibility;
	} else {
		window.location.hash = '';
		app.visibility = 'all';
	}

}, false);
