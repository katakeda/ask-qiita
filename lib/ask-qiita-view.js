'use babel';

require("bootstrap");
const $ = require("jquery");
const showdown = require("showdown");
const converter = new showdown.Converter();

export default class AskQiitaView
{
    constructor(serializedState)
    {
        this.element = document.createElement("div");
        this.element.classList.add("ask-qiita");
        this.element.setAttribute("style", "overflow:scroll; height:100%");
        this.title = "ask-qiita";

        this.initialize();
    }

    initialize()
    {
        this.posts = document.createElement("div");
        this.posts.setAttribute("id", "qiita-posts");
        const searchBar = document.createElement("div");
        const searchInput = document.createElement("input");
        const searchButton = document.createElement("button");
        const initialPosts = document.createElement("div");
        initialPosts.setAttribute("style", "padding:10px; text-align:center");
        initialPosts.innerHTML = "<h5>No results found.</h5>";
        searchInput.setAttribute("id", "search-input");
        searchInput.setAttribute("type", "text");
        searchInput.setAttribute("style", "width:85%");
        searchButton.setAttribute("id", "search-button");
        searchButton.setAttribute("style", "width:15%");
        searchBar.setAttribute("id", "search-bar");
        searchBar.setAttribute("style", "display:flex");
        searchBar.append(searchInput);
        searchBar.append(searchButton);

        this.posts.append(initialPosts);
        this.element.append(searchBar)
        this.element.append(this.posts);
    }

    // Returns an object that can be retrieved when package is activated
    serialize() {}

    // Tear down any state and detach
    destroy()
    {
        this.element.remove();
    }

    getTitle()
    {
        return this.title;
    }

    getElement()
    {
        return this.element;
    }

    createElementFromPost(post)
    {
        const element = document.createElement("div");
        const date = new Date(post.created_at);
        const created_at = date.toLocaleString();
        element.setAttribute("style", "padding:10px; max-height:500px; overflow:scroll");
        element.classList.add("card");
        element.innerHTML = `
            <img class="card-img-top" style="max-height:50px; max-width:50px; border-radius:50px" src="${post.user.profile_image_url}" alt="${post.user.id}">
            <div class="card-body">
                <h5 class="card-title"><strong>${post.title}</strong></h5>
                <h5 class="card-subtitle">${created_at}</h5>
                <p class="card-text">${converter.makeHtml(post.body)}</p>
            </div>
        `;

        this.posts.append(element);
        this.posts.append(document.createElement("hr"));
        this.element.append(this.posts);
    }

    emptyPosts()
    {
        $(this.posts).empty();
    }

}