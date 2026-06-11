<?php
        $cPAGE['name']  = "ความรู้ด้านการจัดการดิน";
        $cPAGE['alias'] = "soil-improvement";
        $cPAGE['link']  = "soil-improvement.php";
        $cPAGE['desc']  = "ความรู้ด้านการจัดการดินและวิธีเก็บตัวอย่างดิน บริษัท มิตรผลวิจัย พัฒนาอ้อยและน้ำตาล จำกัด";
        $cPAGE['hide_page_title'] = true;

        include_once COMPONENT_PATH . 'lib_header.php';
?>

<div class="ag-page-banner">
  <div class="container-xl ag-page-banner-inner">
    <div class="ag-kicker"><i class="bi bi-book-fill me-1"></i>Knowledge</div>
    <h1>ความรู้ด้านการจัดการดิน</h1>
    <p>แนะนำสารปรับปรุงดิน วิธีเก็บตัวอย่างดิน และเทคนิคการดูแลดินเพื่อเพิ่มผลผลิต</p>
  </div>
</div>

<section class="section public-knowledge-page">
  <div class="container">

    <!-- Topic Cards -->
    <div class="public-knowledge-grid scroll-reveal stagger-1">

      <button class="public-knowledge-topic-card" data-topic="vinasses" aria-expanded="false">
        <div class="public-knowledge-card-icon"><i class="bi bi-droplet-fill"></i></div>
        <div class="public-knowledge-card-body">
          <h3>สารปรับปรุงดิน วีแนส</h3>
          <p>น้ำที่ผ่านการกลั่นเอทานอล อุดมธาตุอาหาร ปรับปรุงโครงสร้างดิน เพิ่มอินทรียวัตถุ</p>
        </div>
        <i class="bi bi-chevron-down public-knowledge-card-chevron"></i>
      </button>

      <button class="public-knowledge-topic-card" data-topic="soilmate" aria-expanded="false">
        <div class="public-knowledge-card-icon"><i class="bi bi-bag-fill"></i></div>
        <div class="public-knowledge-card-body">
          <h3>ปุ๋ยอินทรีย์ซอยล์เมต</h3>
          <p>ผลิตจากฟิลเตอร์เค้กและตะกอนวีแนส ฟื้นฟูดิน เสริมธาตุอาหาร บำรุงการเจริญเติบโต</p>
        </div>
        <i class="bi bi-chevron-down public-knowledge-card-chevron"></i>
      </button>

      <button class="public-knowledge-topic-card" data-topic="filtercake" aria-expanded="false">
        <div class="public-knowledge-card-icon"><i class="bi bi-funnel-fill"></i></div>
        <div class="public-knowledge-card-body">
          <h3>กากตะกอนหม้อกรอง</h3>
          <p>ตะกอนจากกระบวนการผลิตน้ำตาล (Filter Cake) อุดมอินทรียวัตถุ ลดกรด ปรับปรุงดิน</p>
        </div>
        <i class="bi bi-chevron-down public-knowledge-card-chevron"></i>
      </button>

      <button class="public-knowledge-topic-card" data-topic="soilsample" aria-expanded="false">
        <div class="public-knowledge-card-icon"><i class="bi bi-clipboard-check-fill"></i></div>
        <div class="public-knowledge-card-body">
          <h3>วิธีเก็บตัวอย่างดิน</h3>
          <p>คู่มือ 6 ขั้นตอนเก็บตัวอย่างดินอย่างถูกวิธี เพื่อผลวิเคราะห์ที่แม่นยำ</p>
        </div>
        <i class="bi bi-chevron-down public-knowledge-card-chevron"></i>
      </button>

    </div>

    <!-- ═══ Detail: วีแนส ═══ -->
    <div class="public-knowledge-detail-panel" id="detail-vinasses">
      <div class="public-knowledge-detail-header">
        <div class="public-knowledge-detail-icon"><i class="bi bi-droplet-fill"></i></div>
        <div>
          <h3>สารปรับปรุงดิน วีแนส (Vinasses)</h3>
          <p>วัสดุปรับปรุงดินจากกระบวนการผลิตเอทานอล</p>
        </div>
        <button class="public-knowledge-detail-close" data-close-topic="vinasses" aria-label="ปิด">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>

      <p class="fst-italic">
        วีแนส (Vinasses) คือ น้ำที่ผ่านกระบวนการกลั่นเอทานอล มีลักษณะเป็นของเหลวสีน้ำตาลเข้มประกอบด้วยอินทรียวัตถุและธาตุอาหารพืชหลายชนิด จึงเป็นทั้งสารปรับปรุงดินและสามารถทดแทนธาตุอาหารพืชได้บางส่วน ในวีแนสน้ำหนัก 1 ตันที่มีความเข้มข้น 30 บริกซ์ จะมีส่วนผสมโดยประมาณ คืออินทรียวัตถุ 173 กิโลกรัม อินทรีย์ไนโตรเจน 4-5 กิโลกรัม ฟอสฟอรัส 0.7-1.0 กิโลกรัม โพแทสเซียม 18-20 กิโลกรัม แคลเซียม 6 กิโลกรัม แมกนีเซียม 1-2 กิโลกรัม และ โซเดียม 3-4 กิโลกรัม
      </p>

      <h4 class="mt-4">อัตราการใช้และวิธีการใช้ วีแนส</h4>

      <h5 class="mt-4"><i class="bi bi-1-circle"></i> อ้อยปลูก | ดินทรายดินร่วนปนทราย</h5>
      <div class="table-responsive mt-2">
        <table class="table public-knowledge-table">
          <thead>
            <tr>
              <th>ความเข้มข้น (บริกซ์)</th>
              <th>อัตราการใส่ (ลิตร/ไร่)</th>
              <th>ช่วงการใส่</th>
              <th>วิธีการใส่</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="text-center">30</td>
              <td class="text-center">5000 (5 คิว)</td>
              <td class="text-center">ไถเตรียมดิน</td>
              <td>ราดบนผิวดินแล้วไถพรวน ปล่อยไว้ 30 วัน จึงปลูกอ้อย (ใส่ปีละ 1 ครั้ง)</td>
            </tr>
            <tr>
              <td class="text-center">15</td>
              <td class="text-center">10000 (10 คิว)</td>
              <td class="text-center">ไถเตรียมดิน</td>
              <td>ราดบนผิวดินแล้วไถพรวน ปล่อยไว้ 30 วัน จึงปลูกอ้อย (ใส่ปีละ 1 ครั้ง)</td>
            </tr>
            <tr>
              <td class="text-center">2.5</td>
              <td class="text-center">ไม่จำกัด</td>
              <td class="text-center">ช่วงปลูก หลังปลูก</td>
              <td>ราดลงบนร่อง เพื่อเพิ่มความชื้นดินในการปลูกอ้อยแบบราดร่อง หรือให้แทนน้ำชลประทานหลังจากที่อ้อยงอกแล้ว</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h5 class="mt-4"><i class="bi bi-2-circle"></i> อ้อยตอ | ดินทรายดินร่วนปนทราย</h5>
      <div class="table-responsive mt-2">
        <table class="table public-knowledge-table">
          <thead>
            <tr>
              <th>ความเข้มข้น (บริกซ์)</th>
              <th>อัตราการใส่ (ลิตร/ไร่)</th>
              <th>ช่วงการใส่</th>
              <th>วิธีการใส่</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="text-center">30</td>
              <td class="text-center">3000-5000 (3-5 คิว)</td>
              <td class="text-center">หลังเก็บเกี่ยวอ้อย</td>
              <td>ราดบนต้นอ้อยทันทีหลังตัดอ้อยก่อนที่อ้อยตอจะงอก และให้น้ำตาม (ใส่ปีละ 1 ครั้ง)</td>
            </tr>
            <tr>
              <td class="text-center">15</td>
              <td class="text-center">5000 (5 คิว)</td>
              <td class="text-center">หลังเก็บเกี่ยวอ้อย</td>
              <td>ราดบนต้นอ้อยทันทีหลังตัดอ้อยก่อนที่อ้อยตอจะงอก และให้น้ำตาม (ใส่ปีละ 1 ครั้ง)</td>
            </tr>
            <tr>
              <td class="text-center">2.5</td>
              <td class="text-center">ไม่จำกัด</td>
              <td class="text-center">หลังเก็บเกี่ยวอ้อย</td>
              <td>ราดลงบนร่อง เพื่อเพิ่มความชื้นดินในการปลูกอ้อยแบบราดร่อง หรือให้แทนน้ำชลประทานหลังจากที่อ้อยงอกแล้ว</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h5 class="mt-4"><i class="bi bi-3-circle"></i> อ้อยปลูก | ดินเหนียวดินร่วนเหนียว</h5>
      <div class="table-responsive mt-2">
        <table class="table public-knowledge-table">
          <thead>
            <tr>
              <th>ความเข้มข้น (บริกซ์)</th>
              <th>อัตราการใส่ (ลิตร/ไร่)</th>
              <th>ช่วงการใส่</th>
              <th>วิธีการใส่</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="text-center">30</td>
              <td class="text-center">3000 (3 คิว)</td>
              <td class="text-center">ไถเตรียมดิน</td>
              <td>ราดบนผิวดินแล้วไถพรวน ปล่อยไว้ 30 วัน จึงปลูกอ้อย (ใส่ 2 ปี เว้น 1 ปี)</td>
            </tr>
            <tr>
              <td class="text-center">15</td>
              <td class="text-center">5000 (5 คิว)</td>
              <td class="text-center">ไถเตรียมดิน</td>
              <td>ราดบนผิวดินแล้วไถพรวน ปล่อยไว้ 30 วัน จึงปลูกอ้อย (ใส่ 2 ปี เว้น 1 ปี)</td>
            </tr>
            <tr>
              <td class="text-center">2.5</td>
              <td class="text-center">ไม่จำกัด</td>
              <td class="text-center">ช่วงปลูก หลังปลูก</td>
              <td>ราดลงบนร่อง เพื่อเพิ่มความชื้นดินในการปลูกอ้อยแบบราดร่อง หรือให้แทนน้ำชลประทานหลังจากที่อ้อยงอกแล้ว</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h5 class="mt-4"><i class="bi bi-4-circle"></i> อ้อยตอ | ดินเหนียวดินร่วนเหนียว</h5>
      <div class="table-responsive mt-2">
        <table class="table public-knowledge-table">
          <thead>
            <tr>
              <th>ความเข้มข้น (บริกซ์)</th>
              <th>อัตราการใส่ (ลิตร/ไร่)</th>
              <th>ช่วงการใส่</th>
              <th>วิธีการใส่</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="text-center">30</td>
              <td class="text-center">2000-3000 (2-3 คิว)</td>
              <td class="text-center">หลังเก็บเกี่ยวอ้อย</td>
              <td>ราดบนต้นอ้อยทันทีหลังตัดอ้อยก่อนที่อ้อยตอจะงอก และให้น้ำตาม (ใส่ 2 ปี เว้น 1 ปี)</td>
            </tr>
            <tr>
              <td class="text-center">15</td>
              <td class="text-center">5000 (5 คิว)</td>
              <td class="text-center">หลังเก็บเกี่ยวอ้อย</td>
              <td>ราดบนต้นอ้อยทันทีหลังตัดอ้อยก่อนที่อ้อยตอจะงอก และให้น้ำตาม (ใส่ 2 ปี เว้น 1 ปี)</td>
            </tr>
            <tr>
              <td class="text-center">2.5</td>
              <td class="text-center">ไม่จำกัด</td>
              <td class="text-center">หลังเก็บเกี่ยวอ้อย</td>
              <td>ราดหลังตัดอ้อย เพื่อเพิ่มความชื้นให้อ้อยตอ สามารถให้ได้ตลอดเวลาโดยไม่จำกัดปริมาณ</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ═══ Detail: ปุ๋ยอินทรีย์ซอยล์เมต ═══ -->
    <div class="public-knowledge-detail-panel" id="detail-soilmate">
      <div class="public-knowledge-detail-header">
        <div class="public-knowledge-detail-icon"><i class="bi bi-bag-fill"></i></div>
        <div>
          <h3>ปุ๋ยอินทรีย์ซอยล์เมต</h3>
          <p>วัสดุปรับปรุงดินจากธรรมชาติ ฟิลเตอร์เค้กและตะกอนวีแนส</p>
        </div>
        <button class="public-knowledge-detail-close" data-close-topic="soilmate" aria-label="ปิด">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>

      <p class="fst-italic">
        ปุ๋ยอินทรีย์ซอยล์เมต ผลิตจากวัตถุดิบธรรมชาติฟิลเตอร์เค้ก และ ตะกอนวีแนส จากไร่อ้อยมิตรผล อุดมไปด้วยธาตุอาหารหลัก ธาตุอาหารรองและธาตุอาหารเสริมต่างๆที่ช่วยฟื้นฟูสภาพดิน บำรุงต้นให้เจริญเติบโต (ออกดอก ออกผล) เสริมการแตกราก เพิ่มประสิทธิภาพการดูดใช้ธาตุอาหารในดิน เพิ่มผลผลิต และเสริมภูมิต้านทานโรค ประกอบด้วยธาตุอาหารหลัก ไนโตรเจน (N), ฟอสฟอรัส (P), โปแตสเซี่ยม (K) และธาตุอาหารรอง ธาตุอาหารเสริมอีกมากมาย ที่จำเป็นต่อการเจริญเติบโตของพืช เช่น แมกนีเซี่ยม (Mg), แคลเซี่ยม (Ca), ซัลเฟต (So3), สังกะสี (Zn), เหล็ก (Fe), ฮอร์โมน, โปรตีนและวิตามินต่าง ๆ
      </p>

      <h4 class="mt-4">อัตราการใช้และวิธีการใช้ ปุ๋ยอินทรีย์</h4>
      <ul class="public-knowledge-list mt-3">
        <li><i class="bi bi-1-circle"></i> <span>ใส่ปุ๋ยช่วงรองพื้น อัตรา 200 กก./ไร่ (4 กระสอบต่อไร่) จากนั้นไถพรวน</span></li>
        <li><i class="bi bi-2-circle"></i> <span>แต่งหน้า อัตรา 100 กก./ไร่ (2 กระสอบต่อไร่) จากนั้นไถกลบ</span></li>
      </ul>
    </div>

    <!-- ═══ Detail: Filter Cake ═══ -->
    <div class="public-knowledge-detail-panel" id="detail-filtercake">
      <div class="public-knowledge-detail-header">
        <div class="public-knowledge-detail-icon"><i class="bi bi-funnel-fill"></i></div>
        <div>
          <h3>กากตะกอนหม้อกรอง (Filter Cake)</h3>
          <p>ตะกอนจากกระบวนการผลิตน้ำตาล วัสดุปรับปรุงดินคุณภาพสูง</p>
        </div>
        <button class="public-knowledge-detail-close" data-close-topic="filtercake" aria-label="ปิด">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>

      <p class="fst-italic">
        กากตะกอนหม้อกรอง (Filter Cake) หรือที่หลายคนเรียกว่า ขี้หม้อกรอง ขี้เค้กอ้อย ขี้อ้อย หรือเค้กอ้อย เป็นตะกอนที่เหลือจากการกรองแยกน้ำอ้อยในกระบวนการผลิตน้ำตาลทราย ลักษณะเป็นของแข็งสีน้ำตาลปนดำ ประกอบด้วยอินทรียวัตถุที่มีประโยชน์ในการปรับปรุงดิน ส่วนประกอบประมาณ 60% เป็นเศษกากอ้อย เศษชิ้นส่วนของใบ กาบใบ ราก เศษดิน ทราย หินหรือกรวด จากการวิเคราะห์พบว่า Filter Cake มีธาตุอาหารที่จำเป็น ได้แก่ ธาตุไนโตรเจน (N) ประมาณ 3% ฟอสฟอรัส (P) ประมาณ 0.24% และโพแทสเซียม (K) ประมาณ 0.2%
      </p>

      <h4 class="mt-4">ประโยชน์ของฟิลเตอร์เค้ก</h4>
      <ul class="public-knowledge-list mt-3">
        <li><i class="bi bi-check-circle-fill text-success"></i> <span>ช่วยเพิ่มปริมาณอินทรียวัตถุในดินให้สูงขึ้น</span></li>
        <li><i class="bi bi-check-circle-fill text-success"></i> <span>ลดความเป็นกรดของดิน</span></li>
        <li><i class="bi bi-check-circle-fill text-success"></i> <span>ช่วยให้ดินร่วนซุย โปร่ง ไม่แน่นทึบ</span></li>
        <li><i class="bi bi-check-circle-fill text-success"></i> <span>เพิ่มธาตุอาหารที่เป็นประโยชน์ต่ออ้อย</span></li>
        <li><i class="bi bi-check-circle-fill text-success"></i> <span>เป็นแหล่งอาหารของจุลินทรีย์ในดินที่เป็นประโยชน์</span></li>
      </ul>

      <h4 class="mt-4">อัตราการใช้และวิธีการใช้ กากตะกอนหม้อกรอง</h4>
      <p class="fst-italic mt-3">
        อ้อยปลูก เมื่อทำการไถรื้อถอนตออ้อยเก่า หรือการไถเปิดหน้าดินเพื่อจะปลูกอ้อยใหม่ ก่อนการปลูกอ้อยครั้งต่อไป ให้นำกากตะกอนหม้อกรองมาใส่ในอัตรา 18–20 ตันต่อไร่ โดยให้กระจายทั่วแปลงโดยใช้เครื่องหว่านปุ๋ยหมัก จากนั้นไถพรวนให้คลุกเคล้าลงไปในดิน พักดินทิ้งไว้ 1–2 เดือน เพื่อให้เกิดการย่อยสลายจนหมด หากไม่พักดินแล้วปลูกอ้อยทันที อาจมีผลให้อ้อยที่งอกออกมามีอาการขาดธาตุไนโตรเจน เนื่องจากจุลินทรีย์จะดึงไนโตรเจนจากดินไปใช้ในกระบวนการย่อยสลาย หลังจากพักดินแล้วจึงทำการเตรียมดินเพื่อปลูกอ้อยต่อไป
      </p>
    </div>

    <!-- ═══ Detail: วิธีเก็บตัวอย่างดิน ═══ -->
    <div class="public-knowledge-detail-panel" id="detail-soilsample">
      <div class="public-knowledge-detail-header">
        <div class="public-knowledge-detail-icon"><i class="bi bi-clipboard-check-fill"></i></div>
        <div>
          <h3>วิธีเก็บตัวอย่างดิน</h3>
          <p>คู่มือสำหรับเกษตรกร — ขั้นตอนการเก็บตัวอย่างดิน</p>
        </div>
        <button class="public-knowledge-detail-close" data-close-topic="soilsample" aria-label="ปิด">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>

      <div class="row gy-3 mb-4">
        <div class="col-md-6">
          <div class="public-soil-image-card">
            <img src="assets/img/1.jpg" class="img-fluid" alt="อุปกรณ์และวิธีเตรียมตัวอย่างดิน">
          </div>
        </div>
        <div class="col-md-6">
          <div class="public-soil-image-card">
            <img src="assets/img/2.jpg" class="img-fluid" alt="การเก็บตัวอย่างดินในแปลง">
          </div>
        </div>
      </div>

      <div class="row gy-3 public-soil-steps">
        <div class="col-lg-6">
          <div class="public-step-card">
            <span class="public-step-number">1</span>
            <h3>เตรียมอุปกรณ์</h3>
            <ul>
              <li><i class="bi bi-check-circle"></i> <span>ถุงพลาสติกสำหรับใส่ตัวอย่างดิน <a href="#">(ขอรับได้ที่ศูนย์บริการเขตส่งเสริมอ้อยฯ)</a></span></li>
              <li><i class="bi bi-check-circle"></i> <span>อุปกรณ์ขุดดิน เช่น จอบ เสียม พลั่ว</span></li>
            </ul>
          </div>
        </div>
        <div class="col-lg-6">
          <div class="public-step-card">
            <span class="public-step-number">2</span>
            <h3>สุ่มเก็บตัวอย่าง</h3>
            <p>การสุ่มเก็บตัวอย่างดินให้เดินสุ่มเก็บเป็นลักษณะสลับไปมาทั่วทั้งแปลง อย่างน้อย 5 จุด (ไม่เกิน 20 ไร่)</p>
          </div>
        </div>
        <div class="col-lg-6">
          <div class="public-step-card">
            <span class="public-step-number">3</span>
            <h3>ขุดดินเก็บตัวอย่าง</h3>
            <p>การขุดดินเก็บตัวอย่าง จะขุดเป็นรูปตัว V ลึกประมาณ 15-30 เซนติเมตร หลังจากนั้นเก็บดิน โดยใช้เสียมแซะดินข้างหลุม (ด้านเรียบ) ให้ได้ดินเป็นแผ่นหนาประมาณ 2-3 เซนติเมตร จนถึงก้นหลุม ดินที่ได้เก็บรวบรวมใส่ภาชนะหรือถุง</p>
          </div>
        </div>
        <div class="col-lg-6">
          <div class="public-step-card">
            <span class="public-step-number">4</span>
            <h3>ผสมและผึ่งดิน</h3>
            <p>ให้นำดินที่ขุดเก็บมาแต่ละจุด มาผสมคลุกเคล้ารวมกันเป็นตัวอย่างเดียว แล้วนำผึ่งในที่ร่มจนแห้ง</p>
          </div>
        </div>
        <div class="col-lg-6">
          <div class="public-step-card">
            <span class="public-step-number">5</span>
            <h3>บรรจุตัวอย่างดิน</h3>
            <p>เก็บตัวอย่างดินใส่ในถุงที่เกษตรกรไปรับมาจากเจ้าหน้าที่เขตส่งเสริมอ้อยฯ ปริมาณอย่างน้อย 500 กรัม หรือครึ่งถุง</p>
          </div>
        </div>
        <div class="col-lg-6">
          <div class="public-step-card">
            <span class="public-step-number">6</span>
            <h3>นำส่งจุดบริการ</h3>
            <p>นำส่งตัวอย่างดินมายังจุดบริการตรวจวิเคราะห์ดินเคลื่อนที่ ตามสถานที่ วัน-เวลา ที่แจ้งในแต่ละวัน</p>
          </div>
        </div>
      </div>

      <div class="public-note-card mt-4">
        <i class="bi bi-exclamation-triangle" aria-hidden="true"></i>
        <p><span>หมายเหตุ</span> หลีกเลี่ยงเก็บดินตัวอย่างจากกองปุ๋ยเก่า กองเศษวัสดุปรับปรุงดิน ต้นไม้ใหญ่ จอมปลวก สิ่งก่อสร้าง ดินถม</p>
      </div>
    </div>

  </div>
</section>

<script>
(function () {
  var cards  = document.querySelectorAll('.public-knowledge-topic-card');
  var panels = {};

  cards.forEach(function (card) {
    var topic = card.dataset.topic;
    var panel = document.getElementById('detail-' + topic);
    if (panel) panels[topic] = panel;
  });

  function closeAll() {
    cards.forEach(function (c) {
      c.setAttribute('aria-expanded', 'false');
      c.classList.remove('is-active');
    });
    Object.keys(panels).forEach(function (k) {
      panels[k].classList.remove('is-open');
    });
  }

  cards.forEach(function (card) {
    card.addEventListener('click', function () {
      var topic  = card.dataset.topic;
      var wasOpen = card.getAttribute('aria-expanded') === 'true';
      closeAll();
      if (!wasOpen) {
        card.setAttribute('aria-expanded', 'true');
        card.classList.add('is-active');
        if (panels[topic]) {
          panels[topic].classList.add('is-open');
          setTimeout(function () {
            panels[topic].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }, 40);
        }
      }
    });
  });

  document.querySelectorAll('.public-knowledge-detail-close').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      closeAll();
    });
  });
}());
</script>

<?php include_once COMPONENT_PATH . 'lib_footer.php' ?>
