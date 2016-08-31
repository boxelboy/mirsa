<?php
namespace Mirsa\Bundle\MirsaBundle\Controller;
ini_set('memory_limit', '-1');

use BusinessMan\Bundle\JobBundle\Form\Type\ChildJobType;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Cache;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Mirsa\Bundle\MirsaBundle\Entity\SalesOrder;
use Symfony\Component\HttpFoundation\Request;
use Mirsa\Bundle\MirsaBundle\Resources\utilities\Filtering;

/**
 * SalesOrderController
 *
 * @author chris saunders
 * @link   http://git.computech-it.co.uk/businessmanportal/JobBundle
 */
class ActivityAssemblyController extends Controller
{
    /**
     * List all salesOrder
     *
     * @return \Symfony\Component\HttpFoundation\Response
     *
     * @Cache(public=true, smaxage=86400, maxage=86400, vary={"Cookie"})
     */
    public function listAction()
    {
        return $this->render('MirsaMirsaBundle:ActivityAssembly:list.html.twig');
    }

    /* Used to export the records, this will also work with the filters */
    public function exportAction(Request $request)
    {

        $id = $request->query->get('id');
        $created = $request->query->get('created');
        $sku = $request->query->get('sku');
        $type = $request->query->get('type');
        $plannedStartDate = $request->query->get('plannedStartDate');
        $plannedEndDate = $request->query->get('plannedEndDate');
        $assemblyStatus = $request->query->get('assemblyStatus');
        $salesOrderNumber = $request->query->get('saleaOrderNumber');
        $customerName = $request->query->get('customerName');
        $tradingCompany = $request->query->get('tradingCompany');

        $response = new StreamedResponse();
        $response->setCallback(function() use (&$id, &$created, &$sku, &$type, &$plannedStartDate, &$plannedEndDate, &$assemblyStatus, &$salesOrderNumber, &$customerName, &$tradingCompany) {
            $fc = fopen('php://output', 'w+');
            fputcsv($fc, array('WorkOrder Number', 'Created', 'Part No.', 'Type', 'Qty', 'Qty Built', 'Qty Quar', 'PPM', 'EFF %','Planned Start', 'Planned End','% Comp', 'Status', 'SO No', 'Customer Name', 'Trading Company'),',');
            $qb = $this->getDoctrine()->getRepository('MirsaMirsaBundle:ActivityAssembly');
            $qb = $qb->createQueryBuilder('aa');
            $qb = $qb->select('aa.id,aa.type,aa.created,aa.sku,aa.assemblyQty,aa.assemblyQtyCompleted,aa.assemblyQtyQuarantined,aa.ppmLevel,aa.ppmEfficiency,aa.plannedStartDate,aa.plannedEndDate,aa.jobProgressPercent,aa.assemblyStatus,aa.salesOrderNumber,aa.customerName,aa.tradingCompany');
            //$qb = $qb->andWhere('aa.type IN (:defaultType)');
            //$qb = $qb->setParameter('defaultType', array('Assembly'));
            $qb->andWhere('aa.assemblyID is not null');
            //$qb->setParameter('null', 'N;');

            $filtering = new Filtering();

            if ($id != "" ) {
                $qb = $qb->andWhere('aa.id = :id');
                $qb = $qb->setParameter('id', $id );
            }  
            if ($created != "" ) {
                $filtering->DateFilter('created', $created, $qb, 'aa');
                //$qb = $qb->andWhere('aa.created = :created');
                //$qb = $qb->setParameter('created', \DateTime::createFromFormat('m/d/Y', $created), 'date');
            }

            if ($sku != "" ) {
                $qb = $qb->andWhere('LOWER(aa.sku) LIKE :sku');
                $qb = $qb->setParameter('sku', '%' . strtolower($sku) . '%');
            }

            if ($type != "" ) {
                $qb = $qb->andWhere('LOWER(aa.type) LIKE :type');
                $qb = $qb->setParameter('type', '%' . strtolower($type) . '%');
            }        

            if ($plannedStartDate != "" ) {
                $filtering->DateFilter('plannedStartDate', $plannedStartDate, $qb, 'aa');
                //$qb = $qb->andWhere('aa.plannedStartDate = :plannedStartDate');
                //$qb = $qb->setParameter('plannedStartDate', \DateTime::createFromFormat('m/d/Y', $plannedStartDate), 'date');
            }
            if ($plannedEndDate != "" ) {
                $filtering->DateFilter('plannedEndDate', $plannedEndDate, $qb, 'aa');
                //$qb = $qb->andWhere('aa.plannedEndDate = :plannedEndDate');
                //$qb = $qb->setParameter('plannedEndDate', \DateTime::createFromFormat('m/d/Y', $plannedEndDate), 'date');
            }
            if ($assemblyStatus != "" ) {
                $qb = $qb->andWhere('LOWER(aa.assemblyStatus) LIKE :assemblyStatus');
                $qb = $qb->setParameter('assemblyStatus', '%' . strtolower($assemblyStatus) . '%');
            }
            if ($salesOrderNumber != "" ) {
                $qb = $qb->andWhere('LOWER(aa.salesOrderNumber) LIKE :salesOrderNumber');
                $qb = $qb->setParameter('salesOrderNumber', '%' . strtolower($salesOrderNumber) . '%');
            }            
            if ($customerName != "" ) {
                $qb = $qb->andWhere('LOWER(aa.customerName) LIKE :customerName');
                $qb = $qb->setParameter('customerName', '%' . strtolower($customerName) . '%');
            }
            if ($tradingCompany != "" ) {
                $qb = $qb->andWhere('LOWER(aa.tradingCompany) LIKE :tradingCompany');
                $qb = $qb->setParameter('tradingCompany', '%' . strtolower($tradingCompany) . '%');
            }

            /* Only export the items for the currently logged in client*/
            if (!is_null($this->getUser()->getContact())) { 
                if ($this->getUser()->getContact()->getClient()) {
                    $qb = $qb->andWhere('aa.client = :client');
                    $qb = $qb->setParameter('client', $this->getUser()->getContact()->getClient());
                }
            }

            $qb = $qb->getQuery();

            $activityAssembly = $qb->getResult();
      
            foreach ($activityAssembly as $item)
            {
                if (is_null($item['created'])) {
                    $createdDate = "";
                }else {
                    $createdDate = date_format($item['created'], "m-d-Y");
                }                
                if (is_null($item['plannedStartDate'])) {
                    $startDate = "";
                } else {
                    $startDate = date_format($item['plannedStartDate'], "m-d-Y");
                }
                if (is_null($item['plannedEndDate'])) {
                    $endDate = "";
                } else {
                    $endDate = date_format($item['plannedEndDate'], "m-d-Y");
                }

                fputcsv($fc, array($item['id'],
                                   $createdDate,
                                   $item['sku'],
                                   $item['type'],
                                   $item['assemblyQty'],
                                   $item['assemblyQtyCompleted'],
                                   $item['assemblyQtyQuarantined'],
                                   $item['ppmLevel'],
                                   $item['ppmEfficiency'],
                                   $startDate,
                                   $endDate,
                                   $item['jobProgressPercent'],
                                   $item['assemblyStatus'],
                                   $item['salesOrderNumber'],
                                   $item['customerName'],
                                   $item['tradingCompany']),
                         ',');
            }
            fclose($fc);
        });
        $filename = "assembly_activity_export_".date("m_d_Y_His").".csv";
        $response->setStatusCode(200);
        $response->headers->set('Content-Type', 'text/csv; charset=utf-8');
        $response->headers->set('Content-Disposition','attachment; filename=' . $filename);
        return $response;
    }
}