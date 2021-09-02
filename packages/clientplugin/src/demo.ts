import { BasePluginvoke, Print } from './index';
import utils from 'utils/index';
import * as $ from 'jquery';

function template() {
  return $('#template').val();
}

const print = new Print({
  appId: 'bosssoft',
  cookie: '1123',
  hostUrl: utils.getHostUrl(),
  downLoadUrl: '',
  queryTempListUrl: '',
  queryTempNameUrl: '',
});

$('#printBtn1').on('click', function () {
  let printSet1 = {};
  print
    .getPrintSet({ ModuleId: '00000001' })
    .then(function (PrintSet: any) {
      printSet1 = PrintSet;
      return $.ajax({
        url: `template/00000001.json`,
        dataType: 'json',
      });
    })
    .then(function (data: any) {
      return print.doPreview({
        LoadReportURL: `${utils.getHostUrl()}template/00000001.grf`,
        PrintPreview: false,
        PrintData: data,
        PrintSet: printSet1,
        ShowForm: true,
      });
    })
    .then(function () {
      console.log('doPreview success');
    })
    .catch(function (e: any) {
      console.log('doPreview error', e);
    });
});

$('#printBtn2').on('click', function () {
  let printSet2 = {};
  print
    .getPrintSet({ ModuleId: '00000002' })
    .then(function (PrintSet: any) {
      printSet2 = PrintSet;
      return $.ajax({
        url: `template/00000002.json`,
        dataType: 'json',
      });
    })
    .then(function (data: any) {
      return print.doPreview({
        LoadReportURL: `${utils.getHostUrl()}template/00000002.grf`,
        PrintPreview: false,
        PrintData: data,
        PrintSet: printSet2,
        ShowForm: true,
      });
    })
    .then(function () {
      console.log('doPreview success');
    })
    .catch(function (e: any) {
      console.log('doPreview error', e);
    });
});

$('#printBtn3').on('click', function () {
  let printSet3 = {};
  print
    .getPrintSet({ ModuleId: '00000003' })
    .then(function (PrintSet: any) {
      printSet3 = PrintSet;
      return $.ajax({
        url: `template/00000003.json`,
        dataType: 'json',
      });
    })
    .then(function (data: any) {
      return print.doPreview({
        LoadReportURL: `${utils.getHostUrl()}template/00000003.grf`,
        PrintPreview: false,
        PrintData: data,
        PrintSet: printSet3,
        ShowForm: true,
      });
    })
    .then(function () {
      console.log('doPreview success');
    })
    .catch(function (e: any) {
      console.log('doPreview error', e);
    });
});
$('#printallBtn').on('click', function () {
  let printSet1 = {};
  let printSet2 = {};
  let printSet3 = {};
  print
    .getPrintSet({ ModuleId: '00000001' })
    .then(function (PrintSet: any) {
      printSet1 = PrintSet;
      return $.ajax({
        url: `template/00000001.json`,
        dataType: 'json',
      });
    })
    .then(function (data: any) {
      return print.doPreview({
        LoadReportURL: `${utils.getHostUrl()}template/00000001.grf`,
        PrintPreview: false,
        PrintData: data,
        PrintSet: printSet1,
        ShowForm: true,
      });
    })
    .then(function () {
      console.log('doPreview success');
    })
    .catch(function (e: any) {
      console.log('doPreview error', e);
    });

  print
    .getPrintSet({ ModuleId: '00000002' })
    .then(function (PrintSet: any) {
      printSet2 = PrintSet;
      return $.ajax({
        url: `template/00000002.json`,
        dataType: 'json',
      });
    })
    .then(function (data: any) {
      return print.doPreview({
        LoadReportURL: `${utils.getHostUrl()}template/00000002.grf`,
        PrintPreview: false,
        PrintData: data,
        PrintSet: printSet2,
        ShowForm: true,
      });
    })
    .then(function () {
      console.log('doPreview success');
    })
    .catch(function (e: any) {
      console.log('doPreview error', e);
    });

  print
    .getPrintSet({ ModuleId: '00000003' })
    .then(function (PrintSet: any) {
      printSet3 = PrintSet;
      return $.ajax({
        url: `template/00000003.json`,
        dataType: 'json',
      });
    })
    .then(function (data: any) {
      return print.doPreview({
        LoadReportURL: `${utils.getHostUrl()}template/00000003.grf`,
        PrintPreview: false,
        PrintData: data,
        PrintSet: printSet3,
        ShowForm: true,
      });
    })
    .then(function () {
      console.log('doPreview success');
    })
    .catch(function (e: any) {
      console.log('doPreview error', e);
    });
});

/** 打印 */
$('#doPreView').on('click', function () {
  let printSet = {};
  print
    .getPrintSet({ ModuleId: '00000000' })
    .then(function (PrintSet: any) {
      printSet = PrintSet;
      return $.ajax({
        url: `template/${template()}.json`,
        dataType: 'json',
      });
    })
    .then(function (data: any) {
      return print.doPreview({
        LoadReportURL: `${utils.getHostUrl()}template/${template()}.grf`,
        PrintPreview: $('#preView').val() === 'true',
        PrintData: data,
        PrintSet: printSet,
        ShowForm: true,
      });
    })
    .then(function () {
      console.log('doPreview success');
    })
    .catch(function (e: any) {
      console.log('doPreview error', e);
    });
});

/** 生成图片 */
$('#doImage').on('click', function () {
  print
    .getPrintSet({ ModuleId: '00000000' })
    .then(function (PrintSet: any) {
      return $.ajax({
        url: `template/${template()}.json`,
        dataType: 'json',
      });
    })
    .then(function (data: any) {
      return print.doImage({
        LoadReportURL: `${utils.getHostUrl()}template/${template()}.grf`,
        PrintData: data,
        PrintSet: data.PrintSet,
      });
    })
    .then(function (data: any) {
      $('#imgbox').empty();
      $(data.list).each(function (index, item) {
        const $img = $('<img>');
        $img.attr('src', `${data.url}?fn=${item}`);
        $img.width('90%');
        $img.css('margin', '0 auto');
        $img.css('display', 'inline-block');
        $('#imgbox').append($img);
      });
    })
    .catch(function () {});
});

/** 批量打印 */
$('#batchPrint1').on('click', function () {
  let printSet = {};
  print
    .getPrintSet({ ModuleId: '00000000' })
    .then(function (PrintSet: any) {
      printSet = PrintSet;
      return $.ajax({
        url: `template/${template()}.array.json`,
        dataType: 'json',
      });
    })
    .then(function (data: any) {
      return print.doPreview({
        LoadReportURL: `${utils.getHostUrl()}template/${template()}.grf`,
        PrintPreview: false,
        PrintData: data,
        PrintSet: printSet,
      });
    })
    .then(function () {
      console.log('batchPrint1 success');
    })
    .catch(function (e: any) {
      console.log('batchPrint1 error', e);
    });
});

/**  */
$('#exportMedia').on('click', function () {
  let PrintSet: any;
  print
    .getPrintSet({ ModuleId: '00000000' })
    .then(function (printSet: any) {
      PrintSet = printSet;
      return $.ajax({ url: `template/${template()}.json`, dataType: 'json' });
    })
    .then(function (data: any) {
      const printData: any = [];
      $(data).each(function (index, item) {
        printData.push({
          Data: item,
          Name: `测试${index}`,
        });
      });
      return print.exportMedia({
        PrintData: printData,
        PrintSet,
        ExportType: 'PDF', // PDF/Excel(默认PDF)
        LoadReportURL: `${utils.getHostUrl()}template/${$('#template').val()}.grf`,
        tempVersion: '0.1',
      });
    });
});

$('#doPrintRemoteImage').on('click', function () {
  print
    .doPrintRemoteImage({
      Url: `${utils.getHostUrl()}template/0.png`,
      PrintPreview: true, // 是否预览
      ShowPrintSet: true, // 是否显示打印份数设置
      ShowMode: 4, // 1：裁剪、2：铺满、3：按比例缩放、4：完整显示、5：平铺
      Name: '', // 打印任务名称
    })
    .then(function (data: any) {
      // console.log('img print success',data);
    })
    .catch(function (e: Error) {
      // console.log('img print error',obj);
    });
});

$('#doCustomPrint').on('click', function () {
  print
    .getPrintSet({ ModuleId: '00000000' })
    .then(function (PrintSet: any) {
      return $.ajax({
        url: 'template/data.json',
        dataType: 'json',
      }).then((data) => {
        return Promise.resolve({ data, PrintSet });
      });
    })
    .then(function (data: any) {
      return print.doCustomPrint({
        PrintData: data.data,
        PrintSet: data.PrintSet,
      });
    })
    .then(function () {
      console.log('doCustomPrint success');
    })
    .catch(function (e: Error) {
      console.log('doCustomPrint error', e);
    });
});

$('#update').on('click', function () {
  Print.clientUpdate(utils.getHostUrl())
    .then(function () {
      console.log(' check update !');
    })
    .catch(function () {
      console.log(' update error... ');
    });
});

$('#heartbeat').on('click', function () {
  Print.heartbeat()
    .then(function () {
      alert('客户端已启动');
    })
    .catch(function () {
      alert('客户端未启动！');
    });
});

$('#start').on('click', function () {
  /** 测试客户端是否启动 */
  BasePluginvoke.heartbeat()
    .then((a) => console.log('heart beat!', a))
    .catch((e) => {
      console.log('error', e);
      /** 当BsService 进程未被关闭时，可以通过发送jsonp请求启动 当BsService 被关闭时，通过注册表启动 */
      BasePluginvoke.startClient('jsonp')
        .then(() => console.log(' client started!'))
        .catch(() => BasePluginvoke.startClient('url'));
    });
});

$('#setPrinterBtn1').on('click', function () {
  print
    .setPrinter({ ModuleId: '00000001', ModuleName: '小票单' })
    .then(function (data: any) {
      console.log('config dos success', data);
    })
    .catch(function (e: Error) {
      console.log('config dos error', e);
    });
  // print.setPrinter({ ModuleId: '00000001' }).then(function (data: any) {
  //     console.log('config dos success', data);
  // }).catch(function (e: Error) {
  //     console.log('config dos error', e);
  // });
});

$('#setPrinterBtn2').on('click', function () {
  print
    .setPrinter({ ModuleId: '00000002', ModuleName: '分拣单' })
    .then(function (data: any) {
      console.log('config dos success', data);
    })
    .catch(function (e: Error) {
      console.log('config dos error', e);
    });
  // print.setPrinter({ ModuleId: '00000001' }).then(function (data: any) {
  //     console.log('config dos success', data);
  // }).catch(function (e: Error) {
  //     console.log('config dos error', e);
  // });
});

$('#setPrinterBtn3').on('click', function () {
  print
    .setPrinter({ ModuleId: '00000003', ModuleName: '快递面单' })
    .then(function (data: any) {
      console.log('config dos success', data);
    })
    .catch(function (e: Error) {
      console.log('config dos error', e);
    });
  // print.setPrinter({ ModuleId: '00000001' }).then(function (data: any) {
  //     console.log('config dos success', data);
  // }).catch(function (e: Error) {
  //     console.log('config dos error', e);
  // });
});

$('#getPrinterBtn').on('click', function () {
  // 打印控件
  print.getPrintSet({ ModuleId: '00000001' }).then(function (data: any) {
    $('#printSet').val(JSON.stringify(data));
  });
});

BasePluginvoke.setDefaultConfig('unstart', () => {
  console.log(' bosssoft client unstart !!!!');
});

BasePluginvoke.setDefaultConfig('updateUrl', 'test');
