document.addEventListener("DOMContentLoaded", () => {
    const url = document.getElementById('url')?.getAttribute("data")
    const lang = document.getElementById('lang')?.getAttribute("data")

    const anchors = document.querySelectorAll('a[href*="#"]')

    for (let anchor of anchors) {
        anchor.addEventListener('click', function (e) {
            e.preventDefault()

            const blockID = anchor.getAttribute('href').substr(1)

            const element = document.getElementById(blockID);
            const yOffset = -26;
            const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;

            window.scrollTo({top: y, behavior: 'smooth'});
        })
    }


    const tooltipElements = document.querySelectorAll('[data-tooltip-id]');
    const body = document.body
    // const overlay = document.querySelector(".overlay")
    //
    // overlay.addEventListener("click", () => console.log("overlay click"))

    console.log(tooltipElements)

    for(const element of tooltipElements) {
        const tooltipId = element.getAttribute("data-tooltip-id")
        console.log(tooltipId)
        const tooltipTemplate = document.getElementById(tooltipId)
        if(tooltipTemplate) {
            // const tooltipModal = document.createElement("div")
            // tooltipModal.innerHTML = tooltipTemplate.innerHTML
            //
            // console.log(element.offsetLeft)
            // console.log(element.offsetTop)
            // console.log(element.getBoundingClientRect().width)
            // tooltipModal.setAttribute("class", "tooltip-box")
            // tooltipModal.style.left = element.offsetLeft + 10 + element.getBoundingClientRect().width + "px"
            // tooltipModal.style.top = element.offsetTop + "px"
            // tooltipModal.style.visibility = "hidden"
            //
            // body.appendChild(tooltipModal)
            //
            // tooltipModal.style.top = (element.offsetTop - tooltipModal.getBoundingClientRect().height / 2 + element.getBoundingClientRect().height / 2) + "px"
            // element.addEventListener("mouseout", (e) => tooltipModal.style.visibility = "hidden")
            // element.addEventListener("mouseover", (e) => tooltipModal.style.visibility = "visible")

            element.addEventListener("click", () => {
                console.log("click")
                if(window.screen.width < 768) {
                    const overlay = document.createElement("div")
                    const tooltipModal = document.createElement("div")
                    const closeBtn = document.createElement("div")

                    closeBtn.setAttribute("class", "close-btn")
                    closeBtn.addEventListener("click", () => overlay.remove())

                    tooltipModal.setAttribute("class", "tippy-box modal")
                    tooltipModal.innerHTML = tooltipTemplate.innerHTML
                    tooltipModal.addEventListener("click", e => e.stopPropagation())

                    overlay.setAttribute("class", "overlay")
                    overlay.addEventListener("click", () => overlay.remove())


                    tooltipModal.appendChild(closeBtn)
                    overlay.appendChild(tooltipModal)
                    body.appendChild(overlay)
                }
            })

            tippy(element, {
                content: tooltipTemplate.innerHTML,
                allowHTML: true,
                placement: "auto-start",
                arrow: false,
                popperOptions: {
                    strategy: 'fixed',
                    modifiers: [
                        {
                            name: 'flip',
                            options: {
                                fallbackPlacements: ['right', 'top'],
                            },
                        },
                        {
                            name: 'preventOverflow',
                            options: {
                                altAxis: true,
                                tether: false,
                            },
                        },
                    ]
                }
            });
        }
        
        //console.log(tooltipTemplate)
    }

    // tippy('.tooltip', {
    //     content: tooltipTemplate,
    //     allowHTML: true,
    //     popperOptions: {
    //         strategy: 'fixed',
    //         modifiers: [
    //             {
    //                 name: 'flip',
    //                 options: {
    //                     fallbackPlacements: ['right', 'top'],
    //                 },
    //             },
    //         ]
    //     }
    // });

    const searchInput = document.querySelector(".search-input")
    const searchInputMobile = document.querySelector(".search-input-mobile")
    let prevValue = ""
    let isOpened = false

    const closeSearchPopup = () => {
        document.querySelector(".search-popup")?.remove()
        isOpened = false
    }

    const searchInputHandler = async (e) => {
        let value = e.target.value
        if(prevValue == value && isOpened == true) return
        prevValue = value
   
        if (value && value.trim().length > 0){
            
            value = value.trim()
            const res = await fetch(url + `/api/articles/search/${lang}/${value}`)
            const data = await res.json()

            console.log(data)
            closeSearchPopup()

            if(data.length) {
                const searchPopup = document.createElement("div")
                searchPopup.classList.add("search-popup")

                for(const article of data) {
                    const {champion} = article
                    console.log(champion)
                    const searchItem = document.createElement("a")
                    searchItem.classList.add("search-item")

                    // const img = document.createElement("div")
                    searchItem.innerHTML = `
                        <img src=${champion.image}>
                        <div class="name">${champion.name[lang]}</div>
                    `
                    searchItem.setAttribute("href", `${url}/${lang}/guides/${article.slug}`)
                    searchPopup.append(searchItem)

                    document.body.addEventListener('click', function (event) {
                        if (!searchPopup.contains(event.target) && !searchInput.contains(event.target)) {
                            closeSearchPopup()
                        }
                    });
                }
    
                if(window.innerWidth > 600) {
                    console.log(document.querySelector(".search-input"))
                    document.querySelector(".search-input-wrapper").append(searchPopup)
                } else {
                    console.log(document.querySelector(".search-input-mobile"))
                    document.querySelector(".search-input-wrapper").append(searchPopup)
                }
                
                isOpened = true
            }
        } else {
            closeSearchPopup()
        }
    }
    searchInput.addEventListener("input", searchInputHandler)
    searchInput.addEventListener("click", searchInputHandler)

    searchInputMobile.addEventListener("input", searchInputHandler)
    searchInputMobile.addEventListener("click", searchInputHandler)

    const langSelect = document.querySelector("#lang-select")
    langSelect.addEventListener("change", (e) => {
        
        if(!(e?.target?.value && e.target.value === lang)) {
            if(window.location.href == `${url}/`) {
                window.location.replace(`${url}/${e.target.value}`);
            } else if(window.location.href == `${url}/${lang}`) {
                window.location.replace(`${url}/`);
            } else {
                window.location.replace(window.location.href.replace(lang, e.target.value));
            }
            
        }
    })

    const bannerButton = document.querySelector(".banner-button")
    if(bannerButton) {
        bannerButton.addEventListener("click", (e) => {
            if(searchInput) searchInput.focus()
            if(searchInputMobile) searchInputMobile.focus()
        })
    }
})

