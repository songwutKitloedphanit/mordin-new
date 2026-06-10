<?php
        $cPAGE['name']  = "รายงานการวิเคราะห์ดิน";//"หน้าหลัก";
        $cPAGE['alias'] = "service";
        $cPAGE['link']  = "service-report.php";
        $cPAGE['desc']  = "ผลการวิเคราะห์ดินจาการรับบริการบนรถวิเคราะห์ดินเคลื่อนที่ บริษัท มิตรผลวิจัย พัฒนาอ้อยและน้ำตาล จำกัด";

        include_once COMPONENT_PATH.'lib_header.php'
?>

    <section id="pricing" class="pricing section">

      <div class="container">

	<div class="row gy-4" style="text-align: center;">

          <div class="col-lg-4 order-2 order-lg-3 mt-2 mb-2" style="text-align: center; align-content: center;"  data-aos="fade-up" data-aos-delay="100">

            <div class="pricing-item">
              <h3> แปลงดอนตาล </h3>
              <span class="advanced bg-danger" >15 เดือน</span>
                <p>พื้นที่แปลง 10 ไร่</p>
                <p>พิกัด 41.40338, 2.17403</p>
                <p>ขอบเขตแปลง ..............</p>
                <p>รหัสโคต้าอ้อย 10005</p>

                <a href="services/report/summary" class="btn btn-primary me-md-2 text-white" style='font-size:15px; width: 200px;'><i class="bi bi-bar-chart-line-fill"></i> รายงานสรุป</a>

                <table class="table" style="text-align: left; align-content: center;" >
                        <tbody>
                                <tr>
                                        <th><span class="text-danger">ปรับปรุงด่วน</span></th>
                                        <td>10-01-2567</td>
                                        <td><a href="assets/report/service-report2.php" class="btn btn-primary rounded-circle text-white p-1" style='font-size:10px; width: 25px;'><i class="bi bi-clipboard-data"></i></a></td>
                                </tr>

                                <tr>
                                        <th><span class="text-warning">ควรปรับปรุง</span></th>
                                        <td>10-01-2566</td>
                                        <td><a href="services/report" class="btn btn-primary rounded-circle text-white p-1 mt-2 mb-2" style='font-size:10px; width: 25px;'><i class="bi bi-clipboard-data"></i></a></td>
                                </tr>
                        </tbody>
                </table>

            </div>
	  </div>

          <div class="col-lg-4 order-1 order-lg-2 mt-2" style="text-align: center; align-content: center;"  data-aos="fade-up" data-aos-delay="100">
	    <h3>ข้อมูลสมาชิก</h3>

		<table class="table" style="text-align: left; align-content: center;" >
			<tbody>
				<tr>
					<th> ชื่อ-นามสกุล</th>
					<td> วรัญญา อรรถเสนา </td>
				</tr>
                                <tr>
                                        <th> หมายเลขเกษตรกร</th>
                                        <td> 0**-****-*00 </td>
                                </tr>

                                <tr>
                                        <th> หมายเลขโทรศัพท์</th>
                                        <td> 083-***-**00 </td>
                                </tr>
                                <tr>
                                        <th> ที่อยู่</th>
                                        <td> 123 หมู่ที่ 5 ต.บุ่ง อ.เมืองอำนาจเจริญ จ.อำนาจเจริญ </td>
				</tr>
			</tbody>
		</table>

		<div class="row mt-2"><div class="col-md-12" style="left: 25%;">
                  <a href="services/report/land" class="btn btn-success btn-lg btn-block text-white" style="width: 300px;">ดูรายงานผลทุกแปลง</a>
                </div></div>

	  </div>

          <div class="col-lg-12 order-3 order-lg-4 mt-2 mb-2" style="text-align: center; align-content: center;"  data-aos="fade-up" data-aos-delay="100">
		<div class="row mt-2 mb-2">
		<hr>
	      	<h4> ผลการวิเคราะห์ดิน แปลงดอนตาล 10-01-2566 (1ปี 1เดือน) </h4>

          <div class="col-xl-12 col-lg-12 mt-4" data-aos="fade-up" data-aos-delay="400">
        <iframe title="ตัวอย่างรายงานผลวิเคราะห์ดิน" style="border:0; width: 100%; height: 1000px;" src="/assets/report/soil-report-2.pdf" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>


          </div>

                </div>
          </div>
    <?php include_once COMPONENT_PATH.'service.php'?>


        </div>

      </div>

    </section><!-- /Contact Section -->


<?php include_once COMPONENT_PATH.'lib_footer.php' ?>
