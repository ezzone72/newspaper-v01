'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Home() {
  const [allNews, setAllNews] = useState<any[]>([]);
  const [filteredNews, setFilteredNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // 상태 관리 (검색, 토픽, 날짜)
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('ALL');
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30); // 기본 30일치 세팅
    return d.toISOString().split('T')[0];
  });
  const [appliedDate, setAppliedDate] = useState(startDate);

  // 펼쳐진 기사 ID 관리
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // 1. 데이터 로딩 (최초 1회) - [수정됨] 뷰(View)에서 통째로 가져옵니다!
  useEffect(() => {
    async function fetchData() {
      const { data, error } = await supabase
        .from('vw_news_with_youtube') // 기존 news_scripts에서 뷰로 변경
        .select('*') // 조인 구문 없이 전체 컬럼을 바로 가져옵니다
        .order('created_at', { ascending: false });

      if (!error && data) {
        setAllNews(data);
        // 초기 로딩 시 설정된 날짜(30일 전) 이후 데이터만 필터링
        setFilteredNews(data.filter(item => item.created_at.split('T')[0] >= appliedDate));
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  // 2. 검색 및 필터 핸들러
  const handleSearch = () => {
    const filtered = allNews.filter((item) => {
      const matchesSearch = 
        item.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.script?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesTopic = selectedTopic === 'ALL' || item.topic === selectedTopic;
      
      const itemDate = item.created_at.split('T')[0];
      const matchesDate = itemDate >= startDate;
      
      return matchesSearch && matchesTopic && matchesDate;
    });

    setFilteredNews(filtered);
    setAppliedDate(startDate);
    setExpandedId(null); 
  };

  const dynamicTopics = Array.from(new Set(allNews.map(item => item.topic).filter(Boolean))).sort() as string[];

  if (loading) return <div className="p-10 text-center text-gray-500 font-bold tracking-widest animate-pulse">AI 소장 뉴스 데이터 분석 중...</div>;

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      
      {/* --- [상단] 본진 바로가기 헤더 --- */}
      <header className="bg-gradient-to-r from-gray-900 via-blue-900 to-black p-6 rounded-3xl shadow-xl border border-blue-800 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="space-y-1 text-center md:text-left">
          <h1 className="text-2xl font-black text-white tracking-tighter">
            지공 뉴스룸 <span className="text-blue-400 text-xs font-normal">v0.1</span>
          </h1>
          <p className="text-[10px] text-blue-300 font-bold uppercase tracking-widest opacity-80">
            AI SOJANG DIGITAL ARCHIVE
          </p>
        </div>

        <div className="flex gap-3">
          <a href="https://www.youtube.com/@aisojang/posts" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-white/10 hover:bg-red-600 text-white px-4 py-2 rounded-2xl border border-white/20 transition-all group">
            <span className="text-lg group-hover:scale-110 transition">📺</span>
            <div className="flex flex-col text-left">
              <span className="text-[9px] font-bold opacity-60">YOUTUBE</span>
              <span className="text-xs font-black">@aisojang</span>
            </div>
          </a>
          <a href="https://aisojang.tistory.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-white/10 hover:bg-orange-500 text-white px-4 py-2 rounded-2xl border border-white/20 transition-all group">
            <span className="text-lg group-hover:scale-110 transition">📝</span>
            <div className="flex flex-col text-left">
              <span className="text-[9px] font-bold opacity-60">TISTORY</span>
              <span className="text-xs font-black">소장 블로그</span>
            </div>
          </a>
        </div>
      </header>

      {/* --- [중단] 검색 및 필터 바 --- */}
      <section className="bg-white p-6 rounded-3xl border shadow-sm flex flex-col md:flex-row gap-3 items-end">
        <div className="flex-1 space-y-1">
          <label className="text-[10px] font-bold text-gray-400 ml-2 uppercase">Keyword</label>
          <input 
            type="text"
            placeholder="제목이나 대본 내용 검색..." 
            className="w-full border rounded-2xl px-5 py-3 bg-gray-50 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full md:w-40 space-y-1">
          <label className="text-[10px] font-bold text-gray-400 ml-2 uppercase">Topic</label>
          <select className="w-full border rounded-2xl px-3 py-3 bg-white text-sm outline-none cursor-pointer" onChange={(e) => setSelectedTopic(e.target.value)}>
            <option value="ALL">전체 ({dynamicTopics.length})</option>
            {dynamicTopics.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="w-full md:w-44 space-y-1">
          <label className="text-[10px] font-bold text-gray-400 ml-2 uppercase">Start Date</label>
          <input 
            type="date" 
            value={startDate} 
            className="w-full border rounded-2xl px-3 py-3 text-sm outline-none cursor-pointer" 
            onChange={(e) => setStartDate(e.target.value)} 
          />
        </div>
        <button 
          onClick={handleSearch}
          disabled={startDate === appliedDate && searchTerm === '' && selectedTopic === 'ALL'}
          className={`px-10 py-3 rounded-2xl font-bold text-sm transition-all ${
            startDate < appliedDate || searchTerm !== '' || selectedTopic !== 'ALL'
            ? 'bg-blue-600 text-white shadow-lg hover:bg-blue-700' 
            : 'bg-gray-100 text-gray-300 cursor-not-allowed'
          }`}
        >
          검색
        </button>
      </section>

      {/* --- [하단] 뉴스 피드 리스트 --- */}
      <div className="grid gap-6">
        <div className="px-2 flex justify-between items-center">
          <span className="text-xs text-gray-400 font-medium">검색 결과: <strong>{filteredNews.length}</strong>건</span>
          <span className="text-[10px] text-gray-300 italic">기준일: {appliedDate} ~ 현재</span>
        </div>

        {filteredNews.map((item) => {
          // [수정됨] 이제 DB의 VIEW에서 youtube_url 컬럼이 직접 넘어오므로, 복잡한 체크 없이 바로 씁니다!
          const youtubeUrl = item.youtube_url;

          return (
            <div key={item.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden transition-all hover:border-blue-200">
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="bg-blue-600 text-white text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-tighter">
                    {item.topic || '기타'}
                  </span>
                  <span className="text-[10px] text-gray-400 font-medium">
                    {new Date(item.created_at).toLocaleString('ko-KR')}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-5 leading-tight tracking-tight">
                  {item.title}
                </h3>

                <div className="relative">
                  <div className={`
                    text-sm text-gray-600 leading-relaxed bg-gray-50 rounded-2xl p-5 border border-gray-100 
                    whitespace-pre-wrap transition-all duration-300 overflow-y-auto
                    ${expandedId === item.id ? 'max-h-[450px]' : 'max-h-[125px] overflow-hidden'}
                  `}>
                    {item.script || "작성된 대본 본문이 없습니다."}
                    {expandedId !== item.id && (
                      <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-gray-50 to-transparent pointer-events-none"></div>
                    )}
                  </div>
                  <div className="flex justify-between items-center px-2 mt-2">
                    <button 
                      onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                      className="text-blue-600 text-[11px] font-bold hover:underline"
                    >
                      {expandedId === item.id ? '▲ 본문 접기' : '▼ 대본 전문 읽기 (스크롤)'}
                    </button>
                    <span className="text-[9px] text-gray-400 italic">약 {item.script?.length || 0}자</span>
                  </div>
                </div>

                {/* 버튼 액션 섹션 */}
                <div className="mt-6 grid grid-cols-2 gap-3">
                  {youtubeUrl ? (
                    <a 
                      href={youtubeUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-red-600 text-white text-center py-3.5 rounded-2xl text-xs font-bold hover:bg-red-700 transition shadow-md"
                    >
                      📺 유튜브 쇼츠
                    </a>
                  ) : (
                    <div className="bg-gray-100 text-gray-400 text-center py-3.5 rounded-2xl text-xs font-bold border border-gray-200">
                      ❌ 링크 없음
                    </div>
                  )}
                  <a href={item.link} target="_blank" rel="noopener noreferrer" className="border border-gray-200 text-gray-600 text-center py-3.5 rounded-2xl text-xs font-bold hover:bg-gray-50 transition">
                    📰 원본 뉴스
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
