'use babel';

require("bootstrap");
const showdown = require("showdown");
const converter = new showdown.Converter();

import AskQiitaView from './ask-qiita-view';
import { CompositeDisposable } from 'atom';

export default
{
    askQiitaView: null,
    disposables: null,
    rightDock: null,
    rightDockPane: null,

    activate(state)
    {
        this.askQiitaView = new AskQiitaView(state.askQiitaViewState);
        this.rightDock = atom.workspace.getRightDock();
        this.rightDockPane = this.rightDock.getActivePane();

        // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
        this.disposables = new CompositeDisposable();

        // Register command that toggles this view
        this.disposables.add(atom.commands.add('atom-workspace', {
            'ask-qiita:search': () => this.search()
        }));

        this.getQiitaPosts = this.getQiitaPosts.bind(this);
        this.handleSearch = this.handleSearch.bind(this);

        const view = this.askQiitaView.getElement();
        const searchButton = view.querySelector("#search-button");
        searchButton.addEventListener("click", this.handleSearch);
    },

    deactivate()
    {
        this.disposables.dispose();
        this.askQiitaView.destroy();
    },

    serialize()
    {
        return {
            askQiitaViewState: this.askQiitaView.serialize()
        };
    },

    async search()
    {
        try {
            if (editor = atom.workspace.getActiveTextEditor()) {
                const selection = editor.getSelectedText();
                const posts = await this.getQiitaPosts(selection);
                this.askQiitaView.emptyPosts();
                if (posts.length > 0) {
                    for (let key in posts) {
                        const post = posts[key];
                        this.askQiitaView.createElementFromPost(post);
                    }
                } else {
                    this.askQiitaView.showEmptyPosts();
                }

                this.rightDockPane.addItem(this.askQiitaView);
                this.rightDockPane.activate();
            }
        } catch (error) {
            atom.notifications.addError(error.message);
        }
    },

    async handleSearch()
    {
        try {
            const keyword = document.getElementById("search-input").value;
            const posts = await this.getQiitaPosts(keyword);
            this.askQiitaView.emptyPosts();
            if (posts.length > 0) {
                for (let key in posts) {
                    const post = posts[key];
                    this.askQiitaView.createElementFromPost(post);
                }
            } else {
                this.askQiitaView.showEmptyPosts();
            }

            this.rightDockPane.addItem(this.askQiitaView);
            this.rightDockPane.activate();
        } catch (error) {
            atom.notifications.addError(error.message);
        }
    },

    async getQiitaPosts(keyword)
    {
        if (typeof keyword !== "string") {
            throw new Error(`Function getQiitaPosts expects parameter 1 to be string. ${typeof keyword} was given.`);
        }

        const MINIMUM_DATE = "2016-01-01";
        const query = `(title:${keyword} or body:${keyword} or code:${keyword} or tag:${keyword}) created:>${MINIMUM_DATE}`;
        const response = await fetch(`https://qiita.com/api/v2/items?query=${query}`);

        if (!response.ok) {
            throw new Error(`Server responded with ${response.status}`);
        }

        return await response.json();
    }

};