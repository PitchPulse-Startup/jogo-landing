// src/indoor/Posts.jsx — the portal's "Posts" tab: what the app's "Post an
// update" does (jogo-APP components/venue/VenuePostComposer.js +
// services/venues.js postVenueUpdate), with the post shown on the page in a
// phone while they write it. Old posts: followers-only / everyone, or delete.
//
// Same feedPosts doc and the same storage folder (feedPosts/{uid}) as the app.
// Photos go through applyKit's uploadImage (resized, year-long cache). Videos
// keep their own type and get NO cache header (storage-media rule).
import React, { useMemo, useState } from 'react';
import { addDoc, collection, deleteDoc, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { ImagePlus, Film, X, Trash2, Globe, Users, Send } from 'lucide-react';
import { db, storage } from '../firebase';
import { uploadImage, loadImage } from './applyKit';
import { usePhoneScale, PHONE_H } from './formKit.jsx';
import VenuePreview, { FullPreview, previewFromVenue, previewFromPost } from './VenuePreview.jsx';
import { toast } from './Toast.jsx';

const MAX_VIDEO_SECONDS = 60;
const MAX_VIDEO_MB = 50;

// Duration + a first-frame poster, read in the browser.
const readVideo = (file) => new Promise((resolve, reject) => {
  const url = URL.createObjectURL(file);
  const v = document.createElement('video');
  v.preload = 'metadata'; v.muted = true; v.playsInline = true; v.src = url;
  v.onloadeddata = () => { v.currentTime = Math.min(0.5, (v.duration || 1) / 2); };
  v.onseeked = () => {
    const c = document.createElement('canvas');
    c.width = v.videoWidth; c.height = v.videoHeight;
    c.getContext('2d').drawImage(v, 0, 0);
    c.toBlob((thumb) => resolve({ url, duration: v.duration, thumb }), 'image/jpeg', 0.7);
  };
  v.onerror = () => { URL.revokeObjectURL(url); reject(new Error('unreadable')); };
});

const put = (path, blob, meta, onBytes) => new Promise((resolve, reject) => {
  const task = uploadBytesResumable(ref(storage, path), blob, meta);
  task.on('state_changed', (s) => onBytes?.(s.bytesTransferred), reject, async () => resolve(await getDownloadURL(task.snapshot.ref)));
});

const author = (venue) => ({
  authorId: venue.id,
  author: { id: venue.id, displayName: venue.name, username: venue.name, photoURL: venue.logoUrl || null },
  venueId: venue.id, venueName: venue.name, venueLogoUrl: venue.logoUrl || null,
});

export default function Posts({ venue, games, posts, followers }) {
  const phoneScale = usePhoneScale();
  const [text, setText] = useState('');
  const [media, setMedia] = useState(null); // { kind: 'image'|'video', file, url, aspect?, duration?, thumb? }
  const [everyone, setEveryone] = useState(false);
  const [busy, setBusy] = useState(null);
  const [err, setErr] = useState(null);
  const [preview, setPreview] = useState(false);

  const pickImage = async (file) => {
    setErr(null);
    try {
      const { img, url } = await loadImage(file);
      setMedia({ kind: 'image', file, url, aspect: Math.round((img.naturalWidth / img.naturalHeight) * 1000) / 1000 });
    } catch { setErr('That photo won’t open here. Try a JPG or PNG.'); }
  };
  const pickVideo = async (file) => {
    setErr(null);
    if (file.size > MAX_VIDEO_MB * 1024 * 1024) { setErr(`That video is too big. Keep it under ${MAX_VIDEO_MB} MB.`); return; }
    try {
      const v = await readVideo(file);
      if (v.duration > MAX_VIDEO_SECONDS + 1) { URL.revokeObjectURL(v.url); setErr(`Keep videos to ${MAX_VIDEO_SECONDS} seconds or less.`); return; }
      setMedia({ kind: 'video', file, url: v.url, duration: Math.round(v.duration), thumb: v.thumb });
    } catch { setErr('That video won’t play here. Try an MP4.'); }
  };
  const clearMedia = () => { if (media?.url) URL.revokeObjectURL(media.url); setMedia(null); };

  const canPost = (text.trim() || media) && !busy;
  const post = async () => {
    if (!canPost) return;
    setErr(null);
    try {
      const prefix = `feedPosts/${venue.id}`;
      const ts = Date.now();
      let m = { mediaUrl: null, mediaType: null, videoDuration: null, videoThumbnail: null };
      if (media?.kind === 'image') {
        setBusy('Uploading your photo…');
        m = { mediaUrl: await uploadImage(media.file, 'photo', `${prefix}/${ts}.jpg`), mediaType: 'image', mediaAspect: media.aspect || null, videoDuration: null, videoThumbnail: null };
      } else if (media?.kind === 'video') {
        const ext = (media.file.name.split('.').pop() || 'mp4').toLowerCase().replace(/[^a-z0-9]/g, '') || 'mp4';
        const total = media.file.size + (media.thumb?.size || 0);
        let a = 0; let b = 0;
        const tick = () => setBusy(`Uploading your video… ${Math.min(99, Math.round(((a + b) / total) * 100))}%`);
        tick();
        const [vUrl, tUrl] = await Promise.all([
          put(`${prefix}/${ts}.${ext}`, media.file, { contentType: media.file.type || 'video/mp4' }, (n) => { a = n; tick(); }),
          media.thumb ? put(`${prefix}/${ts}_thumb.jpg`, media.thumb, { contentType: 'image/jpeg', cacheControl: 'public,max-age=31536000,immutable' }, (n) => { b = n; tick(); }).catch(() => null) : null,
        ]);
        m = { mediaUrl: vUrl, mediaType: 'video', videoDuration: media.duration || null, videoThumbnail: tUrl || null };
      }
      setBusy('Posting…');
      await addDoc(collection(db, 'feedPosts'), {
        ...author(venue),
        content: text.trim().slice(0, 2000),
        mediaUrl: m.mediaUrl,
        mediaType: m.mediaType,
        ...(m.mediaAspect ? { mediaAspect: m.mediaAspect } : {}),
        videoDuration: m.videoDuration,
        videoThumbnail: m.videoThumbnail,
        visibility: everyone ? 'public' : 'followers',
        createdAt: serverTimestamp(),
        likesCount: 0,
        commentsCount: 0,
        likes: [],
      });
      setText(''); clearMedia();
      toast('Posted', everyone ? 'Everyone on Jogo can see it.' : 'It’s on your page and in your followers’ feed.');
    } catch (e) {
      console.error('venue post failed:', e);
      setErr('Couldn’t post that. Check your connection and try again.');
    }
    setBusy(null);
  };

  const draft = text.trim() || media ? { id: 'draft', text: text.trim(), mediaUrl: media?.url, mediaType: media?.kind, at: new Date(), isNew: true } : null;
  const shown = useMemo(() => [...(draft ? [draft] : []), ...posts.filter((p) => p.postType !== 'game').map((p) => previewFromPost(p))], [draft?.text, draft?.mediaUrl, posts]); // eslint-disable-line react-hooks/exhaustive-deps
  const page = { ...previewFromVenue(venue), followers };

  return (
    <div className="grid xl:grid-cols-[minmax(0,1fr)_400px] gap-8 items-start">
      <div className="min-w-0 space-y-5">
        <section className="bg-white rounded-3xl border border-[#E6E8EC] p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-[13px] overflow-hidden bg-[#0E7A43] shrink-0">{venue.logoUrl ? <img src={venue.logoUrl} alt="" className="w-full h-full object-cover" /> : null}</div>
            <div className="min-w-0">
              <div className="font-extrabold text-[#0B0D10] truncate">{venue.name}</div>
              <div className="text-sm font-semibold text-[#5B6270]">Posting to your page{followers ? ` and ${followers} follower${followers === 1 ? '’s' : 's’'} feed` : ''}</div>
            </div>
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={2000}
            placeholder="New turf, a tournament this weekend, open spots tonight…"
            className="mt-4 w-full min-h-[130px] rounded-2xl bg-[#F2F3F5] p-4 text-[17px] font-semibold text-[#0B0D10] outline-none focus:ring-2 focus:ring-[#0B0D10] focus:bg-white resize-y placeholder:text-[#9AA0AB]"
          />
          {media ? (
            <div className="relative mt-3 rounded-2xl overflow-hidden bg-black max-w-sm">
              {media.kind === 'video' ? <video src={media.url} muted playsInline loop autoPlay className="w-full max-h-72 object-cover" /> : <img src={media.url} alt="" className="w-full max-h-72 object-cover" />}
              <button type="button" onClick={clearMedia} aria-label="Remove" className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center"><X size={16} /></button>
            </div>
          ) : null}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <label className="h-11 px-4 rounded-full bg-[#F2F3F5] hover:bg-[#ECEEF1] font-extrabold text-sm inline-flex items-center gap-2 cursor-pointer">
              <ImagePlus size={17} /> Photo
              <input type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) pickImage(e.target.files[0]); e.target.value = ''; }} />
            </label>
            <label className="h-11 px-4 rounded-full bg-[#F2F3F5] hover:bg-[#ECEEF1] font-extrabold text-sm inline-flex items-center gap-2 cursor-pointer">
              <Film size={17} /> Video
              <input type="file" accept="video/mp4,video/quicktime,video/webm" className="hidden" onChange={(e) => { if (e.target.files?.[0]) pickVideo(e.target.files[0]); e.target.value = ''; }} />
            </label>
            <div className="flex bg-[#F2F3F5] rounded-full p-1 ml-auto">
              {[[false, 'Followers', Users], [true, 'Everyone', Globe]].map(([v, l, I]) => (
                <button key={l} type="button" onClick={() => setEveryone(v)} className={`h-9 px-3.5 rounded-full text-sm font-extrabold inline-flex items-center gap-1.5 ${everyone === v ? 'bg-[#0B0D10] text-white' : 'text-[#5B6270]'}`}><I size={14} /> {l}</button>
              ))}
            </div>
          </div>
          {err ? <p className="mt-3 text-sm font-bold text-[#BE123C]">{err}</p> : null}
          <div className="mt-4 flex items-center gap-3">
            <button type="button" disabled={!canPost} onClick={post} className="h-12 px-6 rounded-full bg-[#16A34A] hover:bg-[#15803D] text-white font-extrabold inline-flex items-center gap-2 disabled:opacity-40">
              <Send size={17} /> {busy || 'Post'}
            </button>
            <button type="button" onClick={() => setPreview(true)} className="xl:hidden h-12 px-5 rounded-full border border-[#E6E8EC] font-extrabold">Preview</button>
          </div>
        </section>

        <section className="bg-white rounded-3xl border border-[#E6E8EC] p-5 sm:p-6">
          <h2 className="font-extrabold text-lg text-[#0B0D10] mb-3">Your posts</h2>
          {posts.length ? posts.map((p) => <PostRow key={p.id} p={p} />) : <p className="text-[#6B7280] font-semibold py-4 text-center">Nothing posted yet. Your first update shows on your page and in your followers’ feed.</p>}
        </section>
      </div>

      <aside className="hidden xl:block sticky top-6">
        <div className="text-center mb-3 text-xs font-extrabold tracking-[0.18em] uppercase text-[#5B6270]">{draft ? 'How it’ll look' : 'Your page'}</div>
        <div style={{ height: (PHONE_H + 20) * Math.min(phoneScale, 0.92) }}>
          <div style={{ transform: `scale(${Math.min(phoneScale, 0.92)})`, transformOrigin: 'top center' }}>
            <VenuePreview venue={page} focus={shown.length ? 'updates' : 'hero'} height={PHONE_H} games={games} posts={shown} />
          </div>
        </div>
      </aside>
      {preview ? <FullPreview venue={page} games={games} posts={shown} focus={shown.length ? 'updates' : 'hero'} onClose={() => setPreview(false)} label={draft ? 'How it’ll look' : 'Your page'} /> : null}
    </div>
  );
}

function PostRow({ p }) {
  const [sure, setSure] = useState(false);
  const at = p.createdAt?.toDate ? p.createdAt.toDate() : null;
  const isGame = p.postType === 'game';
  return (
    <div className="flex items-start gap-3 py-3.5 border-t first:border-t-0 border-[#EEF0F3]">
      {p.mediaUrl ? (
        p.mediaType === 'video'
          ? <div className="w-14 h-14 rounded-xl bg-black overflow-hidden shrink-0">{p.videoThumbnail ? <img src={p.videoThumbnail} alt="" className="w-full h-full object-cover" /> : <Film size={18} className="text-white m-auto mt-4" />}</div>
          : <img src={p.mediaUrl} alt="" className="w-14 h-14 rounded-xl object-cover shrink-0" />
      ) : null}
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-[#0B0D10] line-clamp-2">{isGame ? (p.content || `New game: ${p.gameData?.title || ''}`) : p.content || (p.mediaType === 'video' ? 'Video' : 'Photo')}</p>
        <p className="text-sm font-semibold text-[#9AA0AB]">
          {at ? at.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Just now'} · {p.likesCount || 0} like{p.likesCount === 1 ? '' : 's'} · {p.commentsCount || 0} comment{p.commentsCount === 1 ? '' : 's'}
        </p>
      </div>
      {!isGame ? (
        <button
          type="button"
          onClick={() => updateDoc(doc(db, 'feedPosts', p.id), { visibility: p.visibility === 'public' ? 'followers' : 'public' }).catch(() => toast('Couldn’t change that', 'Try again.'))}
          className="shrink-0 h-9 px-3 rounded-full bg-[#F2F3F5] text-xs font-extrabold inline-flex items-center gap-1.5"
          title="Who sees it"
        >
          {p.visibility === 'public' ? <><Globe size={13} /> Everyone</> : <><Users size={13} /> Followers</>}
        </button>
      ) : null}
      {sure ? (
        <span className="shrink-0 flex gap-1">
          <button type="button" onClick={() => deleteDoc(doc(db, 'feedPosts', p.id)).catch(() => toast('Couldn’t delete that', 'Try again.'))} className="h-9 px-3 rounded-full bg-[#BE123C] text-white text-xs font-extrabold">Delete</button>
          <button type="button" onClick={() => setSure(false)} className="h-9 px-3 rounded-full bg-[#F2F3F5] text-xs font-extrabold">Keep</button>
        </span>
      ) : (
        <button type="button" onClick={() => setSure(true)} aria-label="Delete post" className="shrink-0 w-9 h-9 rounded-full hover:bg-[#FFF1F2] text-[#9AA0AB] hover:text-[#BE123C] flex items-center justify-center"><Trash2 size={16} /></button>
      )}
    </div>
  );
}
