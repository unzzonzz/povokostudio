import LocomotiveScroll from 'https://esm.sh/locomotive-scroll@4.1.4'

let scroll = null;

const currentPage = document.body.dataset.page
if (currentPage !== 'admin') {
    const loadingScreen = document.querySelector('.loading-screen')
    const loadingText = document.querySelector('.loading-text')
    
    if (loadingScreen && loadingText) {
        let progress = 0
        let targetProgress = 0
        let isLoaded = false
        const startTime = performance.now()
        const minLoadingTime = 800
        
        window.addEventListener('load', () => {
            const elapsedTime = performance.now() - startTime
            
            if (elapsedTime >= minLoadingTime) {
                isLoaded = true
                targetProgress = 100
            } else {
                setTimeout(() => {
                    isLoaded = true
                    targetProgress = 100
                }, minLoadingTime - elapsedTime)
            }
        })
        
        function updateLoading() {
            if (!isLoaded && targetProgress < 90) {
                targetProgress += Math.random() * 3
            }
            
            progress += (targetProgress - progress) * 0.1
            
            loadingText.textContent = Math.floor(progress) + '%'
            
            if (progress < 99.9) {
                requestAnimationFrame(updateLoading)
            } else {
                loadingText.textContent = '100%'
                setTimeout(() => {
                    loadingScreen.classList.add('hidden')
                }, 300)
            }
        }
        
        requestAnimationFrame(updateLoading)
    }
}

window.addEventListener("load", () => {
    if (currentPage === "home") {
        scroll = new LocomotiveScroll({
            el: document.querySelector('[data-scroll-container]'),
            smooth: true,
            lerp: 0.08,
            smartphone: {
                smooth: true,
                breakpoint: 0
            },
            tablet: {
                smooth: true
            }
        });
        controlDOM(scroll)
        initBackgroundVideos()
    } else {
        scroll = new LocomotiveScroll({
            el: document.querySelector('[data-scroll-container]'),
            smooth: true,
            lerp: 0.08,
            tablet: {
                smooth: true
            }
        });
        controlDOM(scroll)
        initBackgroundVideos()
    }
    
    if (currentPage === "works") {
        initRemoteForWorks()
        changeFilmData()
    }
})

function controlDOM(scroll) {
    const header = document.querySelector("header")
    const isChecked = header?.querySelector("#remote")
    const remoteDisplay = document.querySelector(".remote-display")
    const section = document.querySelector("section")
    
    if (!header || !isChecked || !remoteDisplay || !section) return

    const sectionHeight = section.offsetHeight
    let menuOpen = false

    scroll.on('scroll', (args) => {
        if (menuOpen) return
        
        if (args.scroll.y >= sectionHeight - 25) {
            header.classList.add("activate")
        } else {
            header.classList.remove("activate")
        }
    })

    isChecked.addEventListener("change", () => {
        if (isChecked.checked) {
            menuOpen = true
            remoteDisplay.classList.add("activate")
            header.classList.remove("activate")
        } else {
            menuOpen = false
            remoteDisplay.classList.remove("activate")
            if (scroll.scroll.instance.scroll.y >= sectionHeight - 25) {
                header.classList.add("activate")
            }
        }
    })
}

function initRemoteForWorks() {
    const header = document.querySelector("header")
    const isChecked = header?.querySelector("#remote")
    const remoteDisplay = document.querySelector(".remote-display")
    
    if (!header || !isChecked || !remoteDisplay) return
    
    isChecked.addEventListener("change", () => {
        if (isChecked.checked) {
            remoteDisplay.classList.add("activate")
        } else {
            remoteDisplay.classList.remove("activate")
        }
    })
}

function changeFilmData() {
    const fixedFilmContainer = document.querySelector(".fixed-film")
    const fixedIframe = fixedFilmContainer?.querySelector("iframe")
    const textTitle = fixedFilmContainer?.querySelector(".text-01")
    const readMoreLink = fixedFilmContainer?.querySelector(".read-more a")
    
    if (!fixedIframe || !fixedFilmContainer) return
    
    const filmList = document.querySelectorAll(".film-grid .film")
    let selected = null
    let isTransitioning = false
    
    if (filmList.length > 0) {
        const firstFilm = filmList[0]
        selected = firstFilm
        firstFilm.querySelector("img").classList.add("selected")
    }

    filmList.forEach(film => {
      film.querySelector("img").addEventListener("click", (e) => {
        if (scroll && scroll.scrollTo) {
            scroll.scrollTo(0)
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' })
        }

        const videoUrl = film.dataset.video
        const title = film.dataset.title
        const content = film.dataset.content
        const workId = film.dataset.workId

        if (fixedIframe.src === videoUrl && !isTransitioning) return
        if (isTransitioning) return

        if (selected) selected.querySelector("img").classList.remove("selected")
        selected = film
        selected.querySelector("img").classList.add("selected")
        
        isTransitioning = true
        
        fixedFilmContainer.style.transition = 'opacity 0.5s ease-in-out'
        fixedFilmContainer.style.opacity = 0
        
        setTimeout(() => {
            fixedIframe.src = videoUrl
            
            if (textTitle) textTitle.textContent = title
            if (readMoreLink) {
                readMoreLink.href = `/works/${workId}`
                readMoreLink.dataset.workId = workId
            }
            
            setTimeout(() => {
                fixedFilmContainer.style.opacity = 1
                
                setTimeout(() => {
                    isTransitioning = false
                }, 500)
            }, 200)
        }, 500)
      })
    })
}

function initBackgroundVideos() {
    const video = document.querySelector('.bg-parallax')
    if (!video) return
    
    const videosData = video.dataset.videos
    if (!videosData) return
    
    let videos
    try {
        videos = JSON.parse(videosData)
    } catch (e) {
        return
    }
    
    if (!videos || videos.length === 0) return
    
    let currentIndex = 0
    
    video.src = videos[currentIndex]
    video.load()
    
    video.addEventListener('ended', () => {
        currentIndex = (currentIndex + 1) % videos.length
        video.src = videos[currentIndex]
        video.load()
        video.play().catch(() => {})
    })
    
    video.addEventListener('error', () => {
        currentIndex = (currentIndex + 1) % videos.length
        if (currentIndex < videos.length && videos[currentIndex]) {
            video.src = videos[currentIndex]
            video.load()
            video.play().catch(() => {})
        }
    })
    
    video.play().catch(() => {})
}