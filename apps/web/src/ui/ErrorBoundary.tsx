import { Component, type ReactNode } from 'react';
export class ErrorBoundary extends Component<{ children: ReactNode }, { error: boolean }> {
  state = { error: false };
  static getDerivedStateFromError(): { error: boolean } {
    return { error: true };
  }
  componentDidCatch(error: Error): void {
    console.error('DriveTalk rendering failed:', error.message);
  }
  render(): ReactNode {
    if (this.state.error)
      return (
        <main className="boot error-panel">
          <div className="wordmark">
            DRIVE<span>TALK</span>
          </div>
          <h1>3D 화면을 열지 못했습니다.</h1>
          <p>
            브라우저의 그래픽 가속을 켜고 다시 열어주세요.
            <br />
            Chrome 또는 Edge 최신 버전을 권장합니다.
          </p>
          <button className="primary" onClick={() => window.location.reload()}>
            다시 시도
          </button>
        </main>
      );
    return this.props.children;
  }
}
